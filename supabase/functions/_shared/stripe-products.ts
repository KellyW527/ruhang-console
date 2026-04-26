/**
 * Stripe 产品/价格映射
 * ----------------------------------------------------------------
 * 这里维护「业务 SKU」与 Stripe Price ID 的对照。
 *
 * 部署流程:
 *   1) 跑 scripts/create-stripe-products.mjs 在 Stripe 创建好 6 个 price
 *   2) 把脚本输出的 price_xxx 填到下面对应位置
 *   3) 重新部署 edge functions
 *
 * 切到 live 模式时:
 *   - 用 live secret key 重跑一次脚本
 *   - 把 live 的 price ID 替换下面的值(或用环境变量区分)
 */

export type ProductType =
  | "subscription_basic"
  | "subscription_premium"
  | "upgrade_diff"
  | "single_1"
  | "single_2"
  | "single_3";

export type ProductDef = {
  type: ProductType;
  /** Stripe Price ID (price_xxx),由脚本生成后回填 */
  priceId: string;
  /** Stripe checkout mode */
  mode: "subscription" | "payment";
  /** 业务说明:解锁多少个项目额度 */
  quotaDelta: number;
  /** 套餐档位(仅订阅类用) */
  tier?: "basic" | "premium";
  /** 中文名,用于 checkout 页面/邮件 */
  displayName: string;
  /** 单价(分,CNY) */
  amountCents: number;
};

// ⚠️ 部署前必须把 priceId 替换成真实的 price_xxx
export const PRODUCTS: Record<ProductType, ProductDef> = {
  subscription_basic: {
    type: "subscription_basic",
    priceId: Deno.env.get("STRIPE_PRICE_BASIC") ?? "price_REPLACE_ME_BASIC",
    mode: "subscription",
    quotaDelta: 3,
    tier: "basic",
    displayName: "基础月度会员",
    amountCents: 5900,
  },
  subscription_premium: {
    type: "subscription_premium",
    priceId: Deno.env.get("STRIPE_PRICE_PREMIUM") ?? "price_REPLACE_ME_PREMIUM",
    mode: "subscription",
    quotaDelta: 10,
    tier: "premium",
    displayName: "高级月度会员",
    amountCents: 19800,
  },
  upgrade_diff: {
    type: "upgrade_diff",
    priceId: Deno.env.get("STRIPE_PRICE_UPGRADE") ?? "price_REPLACE_ME_UPGRADE",
    mode: "payment", // 一次性补差价,订阅档位另行更新
    quotaDelta: 7, // basic 3 + 7 = premium 10
    displayName: "升级到高级会员(补差价)",
    amountCents: 13900,
  },
  single_1: {
    type: "single_1",
    priceId: Deno.env.get("STRIPE_PRICE_SINGLE_1") ?? "price_REPLACE_ME_SINGLE_1",
    mode: "payment",
    quotaDelta: 1,
    displayName: "单个项目额度",
    amountCents: 2200,
  },
  single_2: {
    type: "single_2",
    priceId: Deno.env.get("STRIPE_PRICE_SINGLE_2") ?? "price_REPLACE_ME_SINGLE_2",
    mode: "payment",
    quotaDelta: 2,
    displayName: "两个项目额度",
    amountCents: 4400,
  },
  single_3: {
    type: "single_3",
    priceId: Deno.env.get("STRIPE_PRICE_SINGLE_3") ?? "price_REPLACE_ME_SINGLE_3",
    mode: "payment",
    quotaDelta: 3,
    displayName: "三个项目额度",
    amountCents: 6600,
  },
};
