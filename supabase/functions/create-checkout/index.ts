/**
 * create-checkout
 * ----------------------------------------------------------------
 * 用户在 Pricing 页选了套餐 → 调这个函数 → 返回 Stripe Checkout URL
 *
 * 输入: { product_type: 'subscription_basic' | 'subscription_premium' | 'upgrade_diff' | 'single_1' | 'single_2' | 'single_3' }
 * 输出: { url: string, session_id: string }
 *
 * 设计要点:
 *   - 一定要从 JWT 取 user_id,不信任 client 传的
 *   - 用同一个 stripe_customer 复用(避免一个用户多个 customer)
 *   - 写一条 pending 状态的 order,webhook 收到 paid 后 update
 *   - upgrade_diff 仅在用户当前是 basic 且未到期时允许
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@17.3.1?target=deno";
import { PRODUCTS, type ProductType } from "../_shared/stripe-products.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 1) 校验登录
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "未登录" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "登录已失效" }, 401);
    }
    const userId = userData.user.id;
    const email = userData.user.email ?? undefined;

    // 2) 解析输入
    const body = await req.json().catch(() => ({}));
    const productType = body.product_type as ProductType | undefined;
    if (!productType || !(productType in PRODUCTS)) {
      return json({ error: "无效的 product_type" }, 400);
    }
    const product = PRODUCTS[productType];

    // 3) upgrade_diff 前置校验
    if (productType === "upgrade_diff") {
      const { data: subRows } = await supabase.rpc("get_active_subscription", { _user_id: userId });
      const sub = Array.isArray(subRows) ? subRows[0] : null;
      if (!sub || sub.tier !== "basic") {
        return json({ error: "升级仅对当前基础会员有效" }, 400);
      }
    }

    // 4) 复用 / 创建 Stripe customer
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-10-28.acacia",
    });

    let customerId: string | undefined;
    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      customerId = existing.data[0]?.id;
    }
    if (!customerId) {
      const created = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });
      customerId = created.id;
    }

    // 5) 构造 success/cancel URL(从 origin 推断)
    const origin = req.headers.get("origin") ?? "https://ruhang.app";
    const successUrl = `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/pricing?checkout=canceled`;

    // 6) 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: product.mode,
      customer: customerId,
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // 关键:metadata 让 webhook 能定位用户和产品
      metadata: {
        user_id: userId,
        product_type: productType,
      },
      // 订阅模式时,把 metadata 也复制到 subscription 上(webhook 收的是 subscription 事件)
      ...(product.mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                user_id: userId,
                product_type: productType,
                tier: product.tier ?? "",
              },
            },
          }
        : {
            payment_intent_data: {
              metadata: {
                user_id: userId,
                product_type: productType,
              },
            },
          }),
    });

    // 7) 写 pending order(用 service role 绕过 RLS)
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await serviceClient.from("orders").insert({
      user_id: userId,
      stripe_session_id: session.id,
      product_type: productType,
      amount_cents: product.amountCents,
      currency: "cny",
      status: "pending",
      metadata: { product_name: product.displayName },
    });

    return json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error("[create-checkout]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
