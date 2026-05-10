/**
 * ai-summary
 * ----------------------------------------------------------------
 * 学员完成项目后生成「能力画像」总结，由自部署 MiMo 生成 JSON。
 * 结果写入 public.simulation_ai_summaries（service role），前端按 user_id RLS 读。
 *
 * 入参: { user_simulation_id: string, force?: boolean }
 * 出参: { ok: true, payload: SummaryPayload, model: string, cached: boolean }
 *
 * SummaryPayload:
 *   {
 *     headline: string,
 *     strengths: string[],
 *     improvements: string[],
 *     skill_scores: { dim: string, score: number }[],
 *     summary_paragraph: string
 *   }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const force = Boolean(body.force);
    if (!usId) return json({ error: "缺少 user_simulation_id" }, 400);

    const baseUrl = (Deno.env.get("MIMO_BASE_URL") ?? "").replace(/\/$/, "");
    const apiKey = Deno.env.get("MIMO_API_KEY") ?? "";
    const model = Deno.env.get("MIMO_MODEL") ?? "XiaomiMiMo/MiMo-7B-RL";
    if (!baseUrl) return json({ error: "MIMO 服务未配置" }, 500);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 校验归属
    const { data: us, error: usErr } = await admin
      .from("user_simulations")
      .select("id, user_id, status, simulation:simulations(code, title, company)")
      .eq("id", usId)
      .maybeSingle();
    if (usErr || !us) return json({ error: "项目不存在" }, 404);
    if (us.user_id !== userId) return json({ error: "无权访问" }, 403);
    if (us.status !== "completed") return json({ error: "项目尚未完成" }, 400);

    // 命中缓存
    if (!force) {
      const { data: cached } = await admin
        .from("simulation_ai_summaries")
        .select("payload, model, created_at")
        .eq("user_simulation_id", usId)
        .maybeSingle();
      if (cached) {
        return json({ ok: true, payload: cached.payload, model: cached.model, cached: true });
      }
    }

    // 聚合上下文
    const [{ data: progressRows }, { data: tasks }] = await Promise.all([
      admin
        .from("user_task_progress")
        .select("task_id, status, score, self_eval, updated_at")
        .eq("user_simulation_id", usId),
      admin
        .from("tasks")
        .select("id, order_index, title, brief")
        .eq("simulation_id", (us as any).simulation?.id ?? "")
        .order("order_index"),
    ]);

    // 取每个 task 的最近 3 条用户消息
    const taskIds = (progressRows ?? []).map((r: any) => r.task_id).filter(Boolean);
    let userMessages: any[] = [];
    if (taskIds.length) {
      const { data: msgs } = await admin
        .from("messages")
        .select("task_id, content, message_type, file_name, created_at")
        .in("task_id", taskIds)
        .eq("sender", "user")
        .order("created_at", { ascending: false })
        .limit(60);
      userMessages = msgs ?? [];
    }

    const sim = (us as any).simulation ?? {};
    const taskBlocks = (tasks ?? []).map((t: any) => {
      const prog = (progressRows ?? []).find((p: any) => p.task_id === t.id);
      const recent = userMessages
        .filter((m) => m.task_id === t.id)
        .slice(0, 3)
        .map((m) => `- ${m.message_type === "text" ? m.content : `[${m.message_type}] ${m.file_name ?? ""}`}`)
        .join("\n");
      const selfEval = prog?.self_eval ? JSON.stringify(prog.self_eval) : "无";
      return [
        `### 任务${t.order_index}：${t.title}`,
        `任务说明：${t.brief ?? ""}`,
        `分数：${prog?.score ?? "未评"}`,
        `自评：${selfEval}`,
        `提交摘要：\n${recent || "（无文本提交）"}`,
      ].join("\n");
    }).join("\n\n");

    const systemPrompt = [
      `你是一名资深金融招聘官与培训导师，要为一名实习生写一份「能力画像」总结，用于求职作品集。`,
      `语言：大陆中文金融行业表达；客观、具体、避免空话套话。`,
      `必须严格输出一个 JSON 对象，不要包裹 markdown 代码块、不要任何额外文字。`,
      `JSON 结构：`,
      `{`,
      `  "headline": "一句话能力定位（≤ 25 字）",`,
      `  "strengths": ["3-4 条具体优势，每条 ≤ 30 字"],`,
      `  "improvements": ["2-3 条改进建议，每条 ≤ 30 字"],`,
      `  "skill_scores": [{"dim": "维度名", "score": 0-100 的整数}, ...]（4-6 个维度，覆盖建模、行业理解、沟通表达、严谨度等）,`,
      `  "summary_paragraph": "一段 200-300 字的整体评价"`,
      `}`,
    ].join("\n");

    const userPrompt = [
      `项目：《${sim.title ?? ""}》（${sim.company ?? ""}，code=${sim.code ?? ""}）`,
      ``,
      taskBlocks || "（无任务记录）",
    ].join("\n");

    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && apiKey !== "none" ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("[ai-summary] upstream error", upstream.status, text.slice(0, 500));
      return json({ error: "上游 AI 服务错误", status: upstream.status }, 502);
    }

    const completion = await upstream.json();
    const raw = completion?.choices?.[0]?.message?.content ?? "";
    let payload: any = null;
    try {
      payload = JSON.parse(raw);
    } catch {
      // 尝试从围栏中抓 JSON
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { payload = JSON.parse(match[0]); } catch { /* ignore */ }
      }
    }
    if (!payload || typeof payload !== "object") {
      return json({ error: "AI 输出无法解析", raw: raw.slice(0, 800) }, 502);
    }

    // upsert（user_simulation_id 唯一）
    const { error: upsertErr } = await admin
      .from("simulation_ai_summaries")
      .upsert({
        user_id: userId,
        user_simulation_id: usId,
        model,
        payload,
      }, { onConflict: "user_simulation_id" });
    if (upsertErr) {
      console.error("[ai-summary] upsert error", upsertErr);
      // 不阻塞返回
    }

    return json({ ok: true, payload, model, cached: false });
  } catch (err) {
    console.error("[ai-summary]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
