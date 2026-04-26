# 入行 RuHang · Edge Functions 部署指南

> 本目录下的三个 functions 全都依赖 Stripe + Supabase service role。
> 第一次部署时按本文档从上到下走一遍。

## 三个 functions 一览

| 函数 | 触发方 | 校验方式 | 用途 |
|------|--------|----------|------|
| `create-checkout` | 前端 Pricing 页 | JWT(verify_jwt=true) | 创建 Stripe Checkout 链接 |
| `stripe-webhook` | Stripe 服务器 | Webhook 签名(verify_jwt=false) | 入账、发配额、续费、取消 |
| `redeem-quota` | 前端 Library 页选项目 | JWT(verify_jwt=true) | 用配额解锁某个 simulation |

## 部署前置

### 1. 必需的 Secrets

在 Supabase Dashboard → Project Settings → Edge Functions → Add Secret 加入:

```
STRIPE_SECRET_KEY        = sk_test_xxx 或 sk_live_xxx
STRIPE_WEBHOOK_SECRET    = whsec_xxx   (步骤 4 后才能拿到)
STRIPE_PRICE_BASIC       = price_xxx   (步骤 3 跑脚本后拿到)
STRIPE_PRICE_PREMIUM     = price_xxx
STRIPE_PRICE_UPGRADE     = price_xxx
STRIPE_PRICE_SINGLE_1    = price_xxx
STRIPE_PRICE_SINGLE_2    = price_xxx
STRIPE_PRICE_SINGLE_3    = price_xxx
```

`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 是 Supabase 自动注入的,不需要手动加。

### 2. 数据库迁移

确认已经在 SQL Editor 跑过 `db/migrations/2026-04-26_add_membership_tables.sql`。

## 部署步骤

### Step 1 — 安装 Supabase CLI(本地一次)

```bash
npm i -g supabase
supabase login
supabase link --project-ref xhkthstyxqbqymwvrdgb
```

### Step 2 — 部署三个 functions

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy redeem-quota
```

部署成功后会得到这三个 URL:

```
https://xhkthstyxqbqymwvrdgb.supabase.co/functions/v1/create-checkout
https://xhkthstyxqbqymwvrdgb.supabase.co/functions/v1/stripe-webhook
https://xhkthstyxqbqymwvrdgb.supabase.co/functions/v1/redeem-quota
```

### Step 3 — 创建 Stripe 产品

```bash
export STRIPE_SECRET_KEY=sk_test_xxx
node scripts/create-stripe-products.mjs
```

脚本会输出 6 个 `STRIPE_PRICE_*=price_xxx`,把它们粘到 Supabase Secrets。

### Step 4 — 在 Stripe 配 webhook

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://xhkthstyxqbqymwvrdgb.supabase.co/functions/v1/stripe-webhook`
3. 选择事件:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. 创建后展开 endpoint → **Signing secret** → 复制 `whsec_xxx`
5. 把它加为 `STRIPE_WEBHOOK_SECRET` secret
6. **重新部署** stripe-webhook 让它读到新 secret:
   ```bash
   supabase functions deploy stripe-webhook
   ```

### Step 5 — 端到端测试(test 模式)

1. 注册一个新账号 → 进 Pricing 页
2. 点「基础月度会员 ¥59」→ 跳到 Stripe Checkout
3. 用 Stripe 测试卡 `4242 4242 4242 4242`,任意未来日期 + CVC,任何邮编
4. 支付成功后跳回 `/dashboard?checkout=success`
5. Dashboard 应显示「基础会员 · 剩余 3」
6. 进 Library → 点一个 Pro 项目 → 选项目 → 配额 -1、卡片解锁

## 升级到 Live 模式

1. Stripe 账号完成实名认证
2. 切到 Live mode,**重新跑** `scripts/create-stripe-products.mjs`(用 `sk_live_xxx`)
3. 在 Stripe Live 模式重配 webhook,拿到新的 `whsec_xxx`
4. 把所有 `STRIPE_*` secrets 替换成 live 值
5. 重新部署三个 functions

## 故障排查

**Q: webhook 一直返回 400 invalid signature**
A: 99% 是 `STRIPE_WEBHOOK_SECRET` 没设对,或者改了之后没重新部署。

**Q: checkout 跳转后报 "无效的 product_type"**
A: 前端传的 `product_type` 必须是这 6 个之一,见 `_shared/stripe-products.ts`。

**Q: 支付成功了但 Dashboard 没刷新**
A: 检查 `subscriptions` 表有没有新行,如果没有 → 看 webhook 日志(Supabase Dashboard → Edge Functions → stripe-webhook → Logs)。
