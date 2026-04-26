/**
 * stripe-webhook
 * ----------------------------------------------------------------
 * 接收 Stripe 事件 → 更新 orders / subscriptions / user_entitlements
 *
 * 必须配的事件(在 Stripe Dashboard → Developers → Webhooks):
 *   - checkout.session.completed       新订阅 / 单买首次完成
 *   - customer.subscription.updated    续费成功 / 状态变更
 *   - customer.subscription.deleted    取消订阅
 *   - invoice.payment_failed           续费失败
 *
 * 设计要点:
 *   - 不验证 JWT,改用 stripe-signature 头校验
 *   - 用 SERVICE_ROLE 写库,绕过 RLS
 *   - 单买 (mode=payment) 创建固定额度,**不**自动绑项目;由 redeem-quota 后续兑换
 *   - 订阅 (mode=subscription) 同理:发"配额池",用户后选项目
 *   - 升级 upgrade_diff:把当前 basic 订阅的 quota_total 直接调成 11、tier 改 premium
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@17.3.1?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-10-28.acacia",
});
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log("[webhook] ignored event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return new Response(`Handler error: ${(err as Error).message}`, { status: 500 });
  }
});

// ---------- handlers ----------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const productType = session.metadata?.product_type;
  if (!userId || !productType) {
    console.error("[webhook] missing metadata on session", session.id);
    return;
  }

  // 1) 标记 order paid
  await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: (session.payment_intent as string) ?? null,
    })
    .eq("stripe_session_id", session.id);

  // 2) 单买类(mode=payment 且非升级)→ 直接发"无主"配额条目
  //    我们用一种"配额条目"约定:simulation_code = `__quota:single`,redeem 时再换成具体项目
  if (
    productType === "single_1" ||
    productType === "single_2" ||
    productType === "single_3"
  ) {
    const count = productType === "single_1" ? 1 : productType === "single_2" ? 2 : 3;
    const rows = Array.from({ length: count }).map((_, i) => ({
      user_id: userId,
      simulation_code: `__quota:single:${session.id}:${i}`, // 占位,redeem 时替换
      source: "single_purchase" as const,
      expires_at: null, // 永久
    }));
    await supabase.from("user_entitlements").insert(rows);
    return;
  }

  // 3) 升级补差价 → 把当前 active basic 订阅升成 premium
  if (productType === "upgrade_diff") {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, quota_used")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("tier", "basic")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sub) {
      // 高级总额 11(免费 1 + 自选 10),已用的项目数继承,所以直接把 total 改成 11
      // 注:免费固定项目 ibd-ipo 不占 quota,所以 quota_total = 10。这里做的是"自选"额度。
      // basic 自选 quota_total=3,升级后改为 10。已用照旧。
      await supabase
        .from("subscriptions")
        .update({ tier: "premium", quota_total: 10 })
        .eq("id", sub.id);
    }
    return;
  }

  // 4) 订阅类(basic / premium):checkout 成功时立即补写 subscription。
  // 不只依赖 customer.subscription.created/updated，避免订阅事件延迟或失败时前端仍显示免费版。
  if (
    (productType === "subscription_basic" || productType === "subscription_premium") &&
    session.subscription
  ) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdated(subscription, { userId, productType });
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  fallback?: { userId?: string; productType?: string },
) {
  const userId = subscription.metadata?.user_id ?? fallback?.userId;
  const productType = subscription.metadata?.product_type ?? fallback?.productType;
  const tier =
    (subscription.metadata?.tier as "basic" | "premium" | undefined) ??
    (productType === "subscription_premium" ? "premium" : productType === "subscription_basic" ? "basic" : undefined);
  if (!userId || !tier) {
    console.error("[webhook] missing metadata on subscription", subscription.id);
    return;
  }

  const quotaTotal = tier === "premium" ? 10 : 3;

  const { rawStart, rawEnd } = getSubscriptionPeriod(subscription);

  if (!isValidUnixTimestamp(rawStart) || !isValidUnixTimestamp(rawEnd)) {
    console.error("[webhook] subscription missing period fields", {
      id: subscription.id,
      rawStart,
      rawEnd,
      itemCount: subscription.items?.data?.length ?? 0,
      itemPeriods: subscription.items?.data?.map((item) => ({
        id: item.id,
        current_period_start: (item as unknown as { current_period_start?: unknown }).current_period_start,
        current_period_end: (item as unknown as { current_period_end?: unknown }).current_period_end,
      })),
    });
    return;
  }

  const periodEnd = new Date(rawEnd * 1000).toISOString();
  const periodStart = new Date(rawStart * 1000).toISOString();

  // upsert by stripe_subscription_id
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, quota_used, current_period_start")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (existing) {
    // 续费/状态变更 → 周期重置,quota_used 归零(进入新周期)
    const isNewPeriod = periodStart !== existing.current_period_start;
    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(isNewPeriod ? { quota_used: 0, quota_total: quotaTotal, tier } : { tier, quota_total: quotaTotal }),
      })
      .eq("id", existing.id);
  } else {
    // 首次创建
    await supabase.from("subscriptions").insert({
      user_id: userId,
      tier,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      quota_total: quotaTotal,
      quota_used: 0,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);
  // 当前周期内的 entitlements 保持有效,直到 expires_at 过期(用 cleanup job 清理)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", invoice.subscription as string);
}
