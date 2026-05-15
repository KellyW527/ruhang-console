/**
 * evaluate-submission
 * ----------------------------------------------------------------
 * Reads an uploaded task deliverable from Supabase Storage, extracts text,
 * and asks self-hosted MiMo (OpenAI-compatible) for structured leader feedback.
 *
 * Environment: MIMO_BASE_URL, MIMO_API_KEY, MIMO_MODEL
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import JSZip from "https://esm.sh/jszip@3.10.1";

const USER_SUBMISSIONS_BUCKET = "user-submissions";
const MAX_EXTRACTED_CHARS = 18_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "未登录" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "登录已失效" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const usId = (body.user_simulation_id as string | undefined)?.trim();
    const task = body.task && typeof body.task === "object" ? body.task : null;
    const submission = body.submission && typeof body.submission === "object" ? body.submission : {};
    if (!usId || !task?.id) return json({ error: "缺少 user_simulation_id 或 task" }, 400);

    const baseUrl = (Deno.env.get("MIMO_BASE_URL") ?? "").replace(/\/$/, "");
    const apiKey = Deno.env.get("MIMO_API_KEY") ?? "";
    const model = Deno.env.get("MIMO_MODEL") ?? "XiaomiMiMo/MiMo-7B-RL";
    if (!baseUrl) return json({ error: "MIMO 服务未配置" }, 500);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: us, error: usErr } = await admin
      .from("user_simulations")
      .select("id, user_id, simulation:simulations(code, title, company)")
      .eq("id", usId)
      .maybeSingle();
    if (usErr || !us) return json({ error: "项目不存在" }, 404);
    if (us.user_id !== userId) return json({ error: "无权访问" }, 403);

    const fileName = String(submission.filename ?? submission.subject ?? "submission");
    const filePath = typeof submission.filePath === "string" ? submission.filePath : "";
    const fileUrl = typeof submission.fileUrl === "string" ? submission.fileUrl : "";
    const fileBytes = await readSubmissionBytes(admin, filePath, fileUrl);
    const extracted = fileBytes
      ? await extractText(fileName, fileBytes)
      : {
          kind: "none",
          text: String(submission.local_summary ?? "用户通过邮件提交了正文或主题，但没有可下载附件。"),
          warnings: ["没有可下载附件，模型只能依据提交元信息评价。"],
        };

    const textForModel = truncate(extracted.text.trim() || "（未能提取到可读正文）", MAX_EXTRACTED_CHARS);
    const rubric = Array.isArray(task.scoring_rubric) ? task.scoring_rubric : [];
    const systemPrompt = [
      `你正在扮演中国金融行业资深带教领导「${body.leader_name ?? "直属上级"}」，职位是${body.leader_role ?? "项目负责人"}。`,
      `你需要根据实习生提交的真实文件内容，给出任务评价。`,
      `语气：${body.leader_tone ?? "专业、直接，但不冷漠"}。反馈风格：${body.feedback_style ?? "balanced"}。`,
      `只输出 JSON 对象，不要 markdown 代码块，不要额外解释。`,
      `JSON 结构：`,
      `{`,
      `  "score": 0-100 的整数,`,
      `  "summary": "一句话总评，≤ 45 字",`,
      `  "leaderMessage": "2-4 句话，像直属领导在 IM 里的反馈",`,
      `  "rubric": [{"dim": "维度名", "score": 0-20 的整数, "max": 20, "comment": "≤ 35 字"}],`,
      `  "strengths": ["2-3 条具体优点"],`,
      `  "improvements": ["2-3 条具体改进建议"],`,
      `  "detailMarkdown": "完整 Markdown 反馈，包含判定结果、评分拆解、上级反馈、下一步修改建议"`,
      `}`,
      `评分必须基于文件内容，不要只因为格式正确就给高分；如果文件内容不足，要明确指出并降低分数。`,
    ].join("\n");

    const userPrompt = [
      `项目：${body.simulation_title ?? (us as any).simulation?.title ?? ""}`,
      `任务：${task.title ?? ""}`,
      `任务说明：${task.brief ?? ""}`,
      `任务要求：${Array.isArray(task.requirements) ? task.requirements.join("；") : ""}`,
      `标准答案/参考口径：${truncate(String(task.standard_answer ?? ""), 3500)}`,
      `原评分维度：${JSON.stringify(rubric).slice(0, 3000)}`,
      `本地格式判定：${submission.local_summary ?? ""}`,
      `提交文件：${fileName}`,
      extracted.warnings.length ? `提取提示：${extracted.warnings.join("；")}` : "",
      ``,
      `--- 文件正文开始 ---`,
      textForModel,
      `--- 文件正文结束 ---`,
    ].filter(Boolean).join("\n");

    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && apiKey !== "none" ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.35,
        max_tokens: 1600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("[evaluate-submission] upstream error", upstream.status, text.slice(0, 500));
      return json({ error: "上游 AI 服务错误", status: upstream.status }, 502);
    }

    const completion = await upstream.json();
    const raw = completion?.choices?.[0]?.message?.content ?? "";
    const feedback = normalizeFeedback(parseJsonObject(raw), task);
    if (!feedback) return json({ error: "AI 输出无法解析", raw: raw.slice(0, 800) }, 502);

    return json({
      ok: true,
      model,
      extractedKind: extracted.kind,
      extractedChars: textForModel.length,
      warnings: extracted.warnings,
      feedback,
    });
  } catch (err) {
    console.error("[evaluate-submission]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

async function readSubmissionBytes(admin: any, filePath: string, fileUrl: string): Promise<Uint8Array | null> {
  if (filePath) {
    const { data, error } = await admin.storage.from(USER_SUBMISSIONS_BUCKET).download(filePath);
    if (!error && data) return new Uint8Array(await data.arrayBuffer());
    console.warn("[evaluate-submission] storage download failed", error);
  }
  if (fileUrl) {
    const resp = await fetch(fileUrl);
    if (resp.ok) return new Uint8Array(await resp.arrayBuffer());
    console.warn("[evaluate-submission] signed url fetch failed", resp.status);
  }
  return null;
}

async function extractText(fileName: string, bytes: Uint8Array): Promise<{ kind: string; text: string; warnings: string[] }> {
  const ext = extensionOf(fileName);
  if (["txt", "md", "csv", "json"].includes(ext)) {
    return { kind: ext, text: new TextDecoder().decode(bytes), warnings: [] };
  }
  if (ext === "docx") return extractDocx(bytes);
  if (ext === "xlsx") return extractXlsx(bytes);
  if (ext === "pptx") return extractPptx(bytes);
  if (ext === "pdf") return extractPdfFallback(bytes);
  return {
    kind: ext || "unknown",
    text: new TextDecoder("utf-8", { fatal: false }).decode(bytes),
    warnings: ["未知文件类型，已尝试按文本提取。"],
  };
}

async function extractDocx(bytes: Uint8Array) {
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file("word/document.xml")?.async("string");
  return {
    kind: "docx",
    text: xmlToText(xml ?? ""),
    warnings: xml ? [] : ["未找到 Word 正文 XML。"],
  };
}

async function extractPptx(bytes: Uint8Array) {
  const zip = await JSZip.loadAsync(bytes);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0));
  const slides = await Promise.all(slideFiles.map(async (name, i) => `## Slide ${i + 1}\n${xmlToText(await zip.file(name)!.async("string"))}`));
  return {
    kind: "pptx",
    text: slides.join("\n\n"),
    warnings: slides.length ? [] : ["未找到 PPT 页面正文。"],
  };
}

async function extractXlsx(bytes: Uint8Array) {
  const zip = await JSZip.loadAsync(bytes);
  const sharedXml = await zip.file("xl/sharedStrings.xml")?.async("string");
  const sharedStrings = sharedXml ? extractXmlTextRuns(sharedXml) : [];
  const sheetFiles = Object.keys(zip.files)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0));
  const sheets: string[] = [];
  for (const [sheetIndex, name] of sheetFiles.entries()) {
    const xml = await zip.file(name)!.async("string");
    const rows = [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].slice(0, 120).map((rowMatch) => {
      const cells = [...rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)].slice(0, 24).map((cellMatch) => {
        const attrs = cellMatch[1];
        const cellXml = cellMatch[2];
        const rawValue = cellXml.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? "";
        if (/\bt="s"/.test(attrs)) return sharedStrings[Number(rawValue)] ?? "";
        return decodeXml(rawValue);
      });
      return cells.filter(Boolean).join(" | ");
    }).filter(Boolean);
    sheets.push(`## Sheet ${sheetIndex + 1}\n${rows.join("\n")}`);
  }
  return {
    kind: "xlsx",
    text: sheets.join("\n\n"),
    warnings: sheets.length ? [] : ["未找到 Excel 工作表正文。"],
  };
}

function extractPdfFallback(bytes: Uint8Array) {
  const decoded = new TextDecoder("latin1").decode(bytes);
  const chunks = [...decoded.matchAll(/\(([^()]{2,500})\)\s*Tj/g)]
    .map((m) => m[1])
    .concat([...decoded.matchAll(/\[([\s\S]{2,1200}?)\]\s*TJ/g)].map((m) => m[1].replace(/[()[\]<>]/g, " ")));
  return {
    kind: "pdf",
    text: chunks.map(decodePdfText).join("\n"),
    warnings: ["PDF 使用轻量文本提取，扫描件或压缩字体可能无法完整读取。"],
  };
}

function normalizeFeedback(value: any, task: any) {
  if (!value || typeof value !== "object") return null;
  const fallbackScore = clampInt(value.score ?? task.fallback_score ?? 75, 0, 100);
  const rubric = Array.isArray(value.rubric)
    ? value.rubric.slice(0, 8).map((item: any) => ({
        dim: String(item.dim ?? "综合表现").slice(0, 30),
        score: clampInt(item.score ?? Math.round(fallbackScore / 5), 0, Number(item.max ?? 20)),
        max: clampInt(item.max ?? 20, 1, 100),
        comment: String(item.comment ?? "").slice(0, 80),
      }))
    : [];
  const detailMarkdown = String(value.detailMarkdown ?? "").trim()
    || [
      `### 判定结果`,
      `- AI 评分：${fallbackScore}`,
      `- 总评：${value.summary ?? "已完成本次提交审阅"}`,
      ``,
      `### 上级反馈`,
      String(value.leaderMessage ?? "这版我看过了，结构基本能接住任务，但还需要继续压实判断依据。"),
    ].join("\n");

  return {
    score: fallbackScore,
    summary: String(value.summary ?? "已完成 AI 审阅").slice(0, 120),
    leaderMessage: String(value.leaderMessage ?? value.summary ?? "这版我看过了，后面按反馈继续改。").slice(0, 500),
    rubric,
    strengths: Array.isArray(value.strengths) ? value.strengths.slice(0, 4).map(String) : [],
    improvements: Array.isArray(value.improvements) ? value.improvements.slice(0, 4).map(String) : [],
    detailMarkdown,
  };
}

function parseJsonObject(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function xmlToText(xml: string) {
  return extractXmlTextRuns(xml).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractXmlTextRuns(xml: string) {
  return [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
    .map((m) => decodeXml(m[1]).trim())
    .filter(Boolean);
}

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function decodePdfText(value: string) {
  return value.replace(/\\([nrtbf()\\])/g, (_m, ch) => {
    if (ch === "n" || ch === "r") return "\n";
    if (ch === "t") return "\t";
    return ch;
  }).replace(/\s{2,}/g, " ").trim();
}

function extensionOf(name: string) {
  return name.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() ?? "";
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max)}\n\n（内容过长，已截断）` : value;
}

function clampInt(value: unknown, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
