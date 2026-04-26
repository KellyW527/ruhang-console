#!/usr/bin/env node
/**
 * create-stripe-products.mjs
 * ----------------------------------------------------------------
 * 一键在 Stripe 创建 6 个产品 + 价格,并打印 Price ID 列表。
 *
 * 用法:
 *   1) cd 到项目根目录
 *   2) export STRIPE_SECRET_KEY=sk_test_xxx   (或 sk_live_xxx 上线时)
 *   3) node scripts/create-stripe-products.mjs
 *
 * 脚本会:
 *   - 创建 6 个 Product(基础订阅 / 高级订阅 / 升级差价 / 单买×3)
 *   - 为每个 product 创建一个 Price(订阅是 recurring monthly,其他 one_time)
 *   - 输出一段可直接粘贴的 ENV 配置和一段 _shared/stripe-products.ts 的替换代码
 *
 * 幂等性:
 *   - 通过 metadata.sku 查重;已存在则复用,不会重复创建
 */

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  console.error("❌ 请先 export STRIPE_SECRET_KEY=sk_test_xxx");
  process.exit(1);
}

const isLive = STRIPE_KEY.startsWith("sk_live_");
console.log(`\n🔑 使用 Stripe ${isLive ? "🔴 LIVE" : "🟢 TEST"} 模式\n`);
if (isLive) {
  console.log("⚠️  你正在 LIVE 模式下创建产品,这会产生真实账单条目。3 秒后继续,Ctrl+C 取消...\n");
  await new Promise((r) => setTimeout(r, 3000));
}

const PRODUCTS = [
  {
    sku: "subscription_basic",
    envName: "STRIPE_PRICE_BASIC",
    name: "入行 RuHang · 基础月度会员",
    description: "每月解锁 3 个 Pro 项目额度,加上 1 个免费固定项目,共 4 个项目,30 天有效",
    amount: 5900,
    recurring: true,
  },
  {
    sku: "subscription_premium",
    envName: "STRIPE_PRICE_PREMIUM",
    name: "入行 RuHang · 高级月度会员",
    description: "每月解锁 10 个 Pro 项目额度,加上 1 个免费固定项目,共 11 个项目,30 天有效",
    amount: 19800,
    recurring: true,
  },
  {
    sku: "upgrade_diff",
    envName: "STRIPE_PRICE_UPGRADE",
    name: "入行 RuHang · 升级到高级会员(补差价)",
    description: "从基础月度升级到高级月度,补差价 ¥139,本月已用项目数继承",
    amount: 13900,
    recurring: false,
  },
  {
    sku: "single_1",
    envName: "STRIPE_PRICE_SINGLE_1",
    name: "入行 RuHang · 单个项目额度",
    description: "购买 1 个项目额度,永久有效,可在项目库自选解锁",
    amount: 2200,
    recurring: false,
  },
  {
    sku: "single_2",
    envName: "STRIPE_PRICE_SINGLE_2",
    name: "入行 RuHang · 两个项目额度",
    description: "购买 2 个项目额度,永久有效,可在项目库自选解锁",
    amount: 4400,
    recurring: false,
  },
  {
    sku: "single_3",
    envName: "STRIPE_PRICE_SINGLE_3",
    name: "入行 RuHang · 三个项目额度",
    description: "购买 3 个项目额度,永久有效,可在项目库自选解锁",
    amount: 6600,
    recurring: false,
  },
];

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeReq(path, params = {}, method = "POST") {
  const body = new URLSearchParams();
  flatten(params, body);
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "GET" ? undefined : body.toString(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(json)}`);
  return json;
}

function flatten(obj, params, prefix = "") {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) flatten(v, params, key);
    else params.append(key, String(v));
  }
}

async function findOrCreate(def) {
  // 查重:按 metadata.sku 搜索
  const search = await stripeReq(
    `/products/search?query=${encodeURIComponent(`metadata['sku']:'${def.sku}'`)}`,
    {},
    "GET"
  );
  let product = search.data?.[0];
  if (product) {
    console.log(`  ↩️  复用 product ${product.id} (${def.sku})`);
  } else {
    product = await stripeReq("/products", {
      name: def.name,
      description: def.description,
      metadata: { sku: def.sku },
    });
    console.log(`  ✅ 创建 product ${product.id} (${def.sku})`);
  }

  // 查现有 prices
  const prices = await stripeReq(
    `/prices?product=${product.id}&active=true&limit=10`,
    {},
    "GET"
  );
  let price = prices.data?.find(
    (p) =>
      p.unit_amount === def.amount &&
      p.currency === "cny" &&
      Boolean(p.recurring) === def.recurring
  );

  if (price) {
    console.log(`  ↩️  复用 price ${price.id}`);
  } else {
    price = await stripeReq("/prices", {
      product: product.id,
      unit_amount: def.amount,
      currency: "cny",
      ...(def.recurring ? { recurring: { interval: "month" } } : {}),
      metadata: { sku: def.sku },
    });
    console.log(`  ✅ 创建 price ${price.id}`);
  }

  return { sku: def.sku, envName: def.envName, productId: product.id, priceId: price.id };
}

console.log("📦 开始处理 6 个产品...\n");
const results = [];
for (const def of PRODUCTS) {
  console.log(`\n[${def.sku}] ${def.name}`);
  const r = await findOrCreate(def);
  results.push(r);
}

console.log("\n\n========================================");
console.log("✨ 全部完成。下面是要做的两件事:");
console.log("========================================\n");

console.log("【1】在 Supabase Dashboard → Edge Functions → Secrets 加入这些环境变量:\n");
for (const r of results) {
  console.log(`  ${r.envName}=${r.priceId}`);
}

console.log("\n【2】或者直接把上面这段贴给 AI,它会写到代码里。\n");
console.log("【3】然后去 Stripe Dashboard → Developers → Webhooks 添加 endpoint:");
console.log("       URL:    https://<你的项目>.supabase.co/functions/v1/stripe-webhook");
console.log("       Events: checkout.session.completed");
console.log("               customer.subscription.created");
console.log("               customer.subscription.updated");
console.log("               customer.subscription.deleted");
console.log("               invoice.payment_failed");
console.log("       创建后复制 'Signing secret' (whsec_xxx) 作为 STRIPE_WEBHOOK_SECRET\n");
