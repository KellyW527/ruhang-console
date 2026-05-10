/**
 * boss-reply
 * ----------------------------------------------------------------
 * Workspace 中 NPC（leader/boss）回复学员消息。
 * 走自部署 MiMo（OpenAI 兼容）服务，流式 SSE 透传。
 *
 * 入参:
 *   {
 *     messages: [{role, content}, ...],
 *     simulation_title?: string,
 *     current_task?: { title, brief } | null,
 *     user_name?: string,
 *     preferred_name?: string,
 *     feedback_style?: string,
 *     reply_pacing?: string,
 *     leader_name?: string,
 *     leader_role?: string,
 *     leader_tone?: string,
 *   }
 *
 * 环境变量: MIMO_BASE_URL, MIMO_API_KEY, MIMO_MODEL
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
    // 校验登录
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "未登录" }, 401);
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "登录已失效" }, 401);

    const baseUrl = (Deno.env.get("MIMO_BASE_URL") ?? "").replace(/\/$/, "");
    const apiKey = Deno.env.get("MIMO_API_KEY") ?? "";
    const model = Deno.env.get("MIMO_MODEL") ?? "XiaomiMiMo/MiMo-7B-RL";
    if (!baseUrl) {
      return json({ error: "MIMO 服务未配置（缺少 MIMO_BASE_URL）" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    const leaderName = (body.leader_name ?? "李哥").toString();
    const leaderRole = (body.leader_role ?? "项目负责人").toString();
    const leaderTone = (body.leader_tone ?? "专业、直接，但不冷漠").toString();
    const userName = (body.preferred_name || body.user_name || "新人").toString();
    const simTitle = (body.simulation_title ?? "金融实习项目").toString();
    const currentTask = body.current_task && typeof body.current_task === "object" ? body.current_task : null;
    const feedbackStyle = (body.feedback_style ?? "balanced").toString();
    const replyPacing = (body.reply_pacing ?? "medium").toString();

    const systemPrompt = [
      `你正在扮演中国金融行业的资深从业者「${leaderName}」，职位是${leaderRole}。`,
      `你正在通过办公 IM 与一名实习生「${userName}」沟通，项目背景是《${simTitle}》。`,
      `语气风格：${leaderTone}。请用大陆中文金融行业的术语和习惯说话，不要使用台湾或港式表达，不要出现表情包。`,
      currentTask ? `当前他/她在做的任务：${currentTask.title ?? ""}。任务说明：${currentTask.brief ?? ""}` : "目前没有进行中的任务，请按 onboarding 节奏回应。",
      `反馈风格偏好：${feedbackStyle}；回复节奏偏好：${replyPacing}。`,
      `严格要求：`,
      `1. 单次回复控制在 2-4 句话，绝不长篇大论；不要重复实习生原话；`,
      `2. 不要扮演实习生，不要替对方决定；遇到对方提交工作时，先问关键细节再给方向；`,
      `3. 不要透露你是 AI，也不要提及"模型""prompt"等元信息；`,
      `4. 如果实习生问的内容与项目无关，礼貌带回到任务上。`,
    ].join("\n");

    const cleanHistory = history
      .filter((m: any) => m && typeof m.content === "string" && m.content.trim())
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content.toString().slice(0, 2000),
      }));

    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && apiKey !== "none" ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        max_tokens: 400,
        messages: [{ role: "system", content: systemPrompt }, ...cleanHistory],
      }),
    });

    if (upstream.status === 429) return json({ error: "请求太频繁，请稍后再试" }, 429);
    if (upstream.status === 402) return json({ error: "AI 余额不足" }, 402);
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      console.error("[boss-reply] upstream error", upstream.status, text.slice(0, 500));
      return json({ error: "上游 AI 服务错误" }, 502);
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("[boss-reply]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
