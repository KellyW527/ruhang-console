/**
 * redeem-quota
 * ----------------------------------------------------------------
 * 用户在 Library 里选一个未解锁的 Pro 项目 → 调这个函数 → 扣配额并发 entitlement
 *
 * 输入: { simulation_code: string }
 * 输出: { ok: true, source: 'subscription' | 'single_purchase', expires_at: string | null }
 *
 * 优先级:
 *   1) 优先消耗"单买永久额度"(__quota:single:* 占位条目),不浪费订阅周期
 *   2) 其次消耗当前 active subscription 的剩余配额
 *
 * 设计要点:
 *   - 一定校验登录;user_id 来自 JWT
 *   - 校验 simulation_code 没被同一用户解锁过(避免重复扣)
 *   - 用 service role 操作 quota / entitlement(绕过 RLS)
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
    const simulationCode = (body.simulation_code as string | undefined)?.trim();
    if (!simulationCode || simulationCode.startsWith("__")) {
      return json({ error: "无效的 simulation_code" }, 400);
    }
    if (simulationCode === "ibd-ipo") {
      return json({ ok: true, source: "free_default", expires_at: null });
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1) 已解锁?直接成功
    const { data: existing } = await admin
      .from("user_entitlements")
      .select("id, source, expires_at")
      .eq("user_id", userId)
      .eq("simulation_code", simulationCode)
      .maybeSingle();
    if (existing) {
      return json({ ok: true, source: existing.source, expires_at: existing.expires_at, already: true });
    }

    // 2) 优先用单买永久额度(__quota:single:* 占位)
    const { data: singleSlot } = await admin
      .from("user_entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("source", "single_purchase")
      .like("simulation_code", "__quota:single:%")
      .limit(1)
      .maybeSingle();

    if (singleSlot) {
      // 把占位条目替换成真实 simulation_code
      const { error: updateErr } = await admin
        .from("user_entitlements")
        .update({ simulation_code: simulationCode })
        .eq("id", singleSlot.id);
      if (updateErr) throw updateErr;
      return json({ ok: true, source: "single_purchase", expires_at: null });
    }

    // 3) 用 active subscription 的剩余配额
    const { data: subRows } = await admin.rpc("get_active_subscription", { _user_id: userId });
    const sub = Array.isArray(subRows) ? subRows[0] : null;
    if (!sub || sub.quota_remaining <= 0) {
      return json({ error: "没有可用的解锁额度", code: "NO_QUOTA" }, 402);
    }

    // 用事务式更新:先 +1 quota_used,成功后插 entitlement
    const { error: incErr } = await admin
      .from("subscriptions")
      .update({ quota_used: sub.quota_used + 1 })
      .eq("id", sub.id)
      .eq("quota_used", sub.quota_used); // 乐观锁,防并发

    if (incErr) throw incErr;

    const { error: insertErr } = await admin.from("user_entitlements").insert({
      user_id: userId,
      simulation_code: simulationCode,
      source: sub.tier === "premium" ? "premium" : "basic",
      subscription_id: sub.id,
      expires_at: sub.current_period_end,
    });
    if (insertErr) {
      // 回滚 quota_used
      await admin
        .from("subscriptions")
        .update({ quota_used: sub.quota_used })
        .eq("id", sub.id);
      throw insertErr;
    }

    return json({ ok: true, source: sub.tier, expires_at: sub.current_period_end });
  } catch (err) {
    console.error("[redeem-quota]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
