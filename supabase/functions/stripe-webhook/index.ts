/**
 * stripe-webhook
 * ----------------------------------------------------------------
 * 接收 Stripe 事件 → 更新 orders / subscriptions / user_entitlements
 *
 * 必须配的事件(在 Stripe Dashboard → Developers → Webhooks):
 *   - checkout.session.completed       新订阅 / 单买首次完成
 *   - customer.subscription.created    订阅首次创建
 *   - customer.subscription.updated    续费成功 / 状态变更
 *   - customer.subscription.deleted    取消订阅
 *   - invoice.payment_failed           续费失败
 *
 * 设计要点:
 *   - 不验证 JWT,改用 stripe-signature 头校验
 *   - 不引入 stripe-node SDK: Supabase Edge 的 Deno 环境会触发
 *     Deno.core.runMicrotasks() 兼容错误,导致订阅事件 500
 *   - 用 SERVICE_ROLE 写库,绕过 RLS
 *   - 单买 (mode=payment) 创建固定额度,**不**自动绑项目;由 redeem-quota 后续兑换
 *   - 订阅 (mode=subscription) 同理:发"配额池",用户后选项目
 *   - 升级 upgrade_diff:把当前 basic 订阅的 quota_total 直接调成 10、tier 改 premium
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const STRIPE_API_VERSION = "2024-10-28.acacia";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();
  let event: StripeEvent;
  try {
    await verifyStripeSignature(rawBody, signature, webhookSecret);
    event = JSON.parse(rawBody) as StripeEvent;
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as StripeCheckoutSession);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdated(event.data.object as StripeSubscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as StripeSubscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as StripeInvoice);
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

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const userId = session.metadata?.user_id;
  const productType = session.metadata?.product_type;
  if (!userId || !productType) {
    console.error("[webhook] missing metadata on session", session.id);
    return;
  }

  // 1) 标记 order paid
  await assertDb(
    supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: getStripeId(session.payment_intent),
      })
      .eq("stripe_session_id", session.id),
    "mark order paid",
  );

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
    await assertDb(supabase.from("user_entitlements").insert(rows), "grant single-purchase quota");
    return;
  }

  // 3) 升级补差价 → 把当前 active basic 订阅升成 premium
  if (productType === "upgrade_diff") {
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("id, quota_used")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("tier", "basic")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`[db] load basic subscription: ${error.message}`);

    if (sub) {
      // basic 自选 quota_total=3,升级后改为 10。已用照旧。
      await assertDb(
        supabase
          .from("subscriptions")
          .update({ tier: "premium", quota_total: 10 })
          .eq("id", sub.id),
        "upgrade subscription",
      );
    }
    return;
  }

  // 4) 订阅类(basic / premium):checkout 成功时立即补写 subscription。
  // 不只依赖 customer.subscription.created/updated，避免订阅事件延迟或失败时前端仍显示免费版。
  const subscriptionId = getStripeId(session.subscription);
  if (
    (productType === "subscription_basic" || productType === "subscription_premium") &&
    subscriptionId
  ) {
    const subscription = await retrieveSubscription(subscriptionId);
    await handleSubscriptionUpdated(subscription, { userId, productType });
  }
}

async function handleSubscriptionUpdated(
  subscription: StripeSubscription,
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

  // 新版 Stripe API 在 customer.subscription.created/updated 事件中
  // 可能不返回 current_period_start/end。此时降级:
  // - periodStart 用 subscription.start_date 或当前时间
  // - periodEnd 用 +30 天兜底(后续 invoice.* 事件会校正)
  // 绝不能因为缺 period 就 return,否则订阅永远写不进库,前端永远显示免费版。
  const nowSec = Math.floor(Date.now() / 1000);
  const fallbackStart = normalizeUnixTimestamp(subscription.start_date) ?? nowSec;
  const fallbackEnd = fallbackStart + 30 * 24 * 60 * 60;

  const effectiveStart = coerceStripeTimestamp(rawStart, fallbackStart);
  const effectiveEnd = coerceStripeTimestamp(rawEnd, fallbackEnd);

  if (!isValidUnixTimestamp(rawStart) || !isValidUnixTimestamp(rawEnd)) {
    console.warn("[webhook] subscription missing period fields, using fallback", {
      id: subscription.id,
      rawStart,
      rawEnd,
      effectiveStart,
      effectiveEnd,
    });
  }

  const periodStart = unixTimestampToIso(effectiveStart, fallbackStart, "current_period_start");
  const periodEnd = unixTimestampToIso(effectiveEnd, fallbackEnd, "current_period_end");
  const stripeCustomerId = getStripeId(subscription.customer);

  // upsert by stripe_subscription_id
  const { data: existing, error } = await supabase
    .from("subscriptions")
    .select("id, quota_used, current_period_start")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  if (error) throw new Error(`[db] load subscription: ${error.message}`);

  if (existing) {
    // 续费/状态变更 → 周期重置,quota_used 归零(进入新周期)
    const isNewPeriod = periodStart !== existing.current_period_start;
    await assertDb(
      supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end ?? false,
          ...(isNewPeriod ? { quota_used: 0, quota_total: quotaTotal, tier } : { tier, quota_total: quotaTotal }),
        })
        .eq("id", existing.id),
      "update subscription",
    );
  } else {
    // 首次创建
    await assertDb(
      supabase.from("subscriptions").insert({
        user_id: userId,
        tier,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeCustomerId,
        status: subscription.status,
        quota_total: quotaTotal,
        quota_used: 0,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      }),
      "insert subscription",
    );
  }
}

function getSubscriptionPeriod(subscription: StripeSubscription): { rawStart: number | undefined; rawEnd: number | undefined } {
  const items = subscription.items?.data ?? [];
  const itemWithPeriod = items.find((item) => {
    return isValidUnixTimestamp(item.current_period_start) && isValidUnixTimestamp(item.current_period_end);
  });

  return {
    rawStart: normalizeUnixTimestamp(subscription.current_period_start ?? itemWithPeriod?.current_period_start),
    rawEnd: normalizeUnixTimestamp(subscription.current_period_end ?? itemWithPeriod?.current_period_end),
  };
}

function normalizeUnixTimestamp(value: unknown): number | undefined {
  return coerceStripeTimestamp(value);
}

function coerceStripeTimestamp(value: unknown, fallback?: number): number | undefined {
  const timestamp = typeof value === "string" ? Number(value) : value;
  if (isValidUnixTimestamp(timestamp)) return timestamp;
  return isValidUnixTimestamp(fallback) ? fallback : undefined;
}

function isValidUnixTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function unixTimestampToIso(value: unknown, fallbackSec: number, label: string) {
  const timestamp = coerceStripeTimestamp(value, fallbackSec) ?? Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) {
    const safeFallback = coerceStripeTimestamp(fallbackSec, Math.floor(Date.now() / 1000))!;
    const fallbackDate = new Date(safeFallback * 1000);
    console.warn("[webhook] invalid subscription timestamp, using fallback", {
      label,
      value,
      fallbackSec: safeFallback,
    });
    return fallbackDate.toISOString();
  }
  return date.toISOString();
}

async function handleSubscriptionDeleted(subscription: StripeSubscription) {
  await assertDb(
    supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.id),
    "cancel subscription",
  );
  // 当前周期内的 entitlements 保持有效,直到 expires_at 过期(用 cleanup job 清理)
}

async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  const subscriptionId = getStripeId(invoice.subscription);
  if (!subscriptionId) return;
  await assertDb(
    supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId),
    "mark subscription past_due",
  );
}

// ---------- Stripe helpers ----------

async function retrieveSubscription(subscriptionId: string): Promise<StripeSubscription> {
  const res = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Stripe-Version": STRIPE_API_VERSION,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[stripe] retrieve subscription failed ${res.status}: ${body}`);
  }

  return await res.json() as StripeSubscription;
}

let hmacKeyPromise: Promise<CryptoKey> | null = null;

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const fields = signatureHeader.split(",").map((part) => {
    const [key, ...valueParts] = part.split("=");
    return [key, valueParts.join("=")] as const;
  });
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  const signatures = fields.filter(([key]) => key === "v1").map(([, value]) => value);

  const timestampSec = Number(timestamp);
  if (!Number.isFinite(timestampSec) || signatures.length === 0) {
    throw new Error("Malformed Stripe signature header");
  }

  const ageSec = Math.floor(Date.now() / 1000) - timestampSec;
  if (Math.abs(ageSec) > 300) {
    throw new Error(`Stripe signature timestamp outside tolerance: ${ageSec}s`);
  }

  const expected = await hmacSha256Hex(`${timestamp}.${payload}`, secret);
  const verified = signatures.some((candidate) => timingSafeEqual(candidate, expected));
  if (!verified) throw new Error("No matching Stripe webhook signature");
}

async function hmacSha256Hex(message: string, secret: string) {
  const encoder = new TextEncoder();
  hmacKeyPromise ??= crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", await hmacKeyPromise, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLength = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLength; i += 1) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

function getStripeId(value: StripeExpandableId | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id ?? null;
}

async function assertDb<T>(query: PromiseLike<{ data: T; error: DbError | null }>, label: string) {
  const { error } = await query;
  if (error) throw new Error(`[db] ${label}: ${error.message}`);
}

// ---------- minimal Stripe/API types ----------

type StripeEvent = {
  type: string;
  data: { object: unknown };
};

type StripeExpandableId = string | { id?: string };

type StripeMetadata = Record<string, string | undefined>;

type StripeCheckoutSession = {
  id: string;
  metadata?: StripeMetadata | null;
  payment_intent?: StripeExpandableId | null;
  subscription?: StripeExpandableId | null;
};

type StripeSubscriptionItem = {
  current_period_start?: number | string | null;
  current_period_end?: number | string | null;
};

type StripeSubscription = {
  id: string;
  metadata?: StripeMetadata | null;
  status: string;
  customer?: StripeExpandableId | null;
  cancel_at_period_end?: boolean | null;
  current_period_start?: number | string | null;
  current_period_end?: number | string | null;
  start_date?: number | string | null;
  items?: { data?: StripeSubscriptionItem[] } | null;
};

type StripeInvoice = {
  subscription?: StripeExpandableId | null;
};

type DbError = {
  message: string;
};