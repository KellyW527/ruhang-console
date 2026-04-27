# 最后一批（🔴 高难度）方案

Hermes 报告里剩下三件硬骨头：

1. **游客 Demo / 公开预览**（最影响转化）
2. **Stripe webhook 的 `Invalid time value` bug**（最影响付费用户）
3. **首页用真实产品截图替换 mock UI**（最影响可信度）

下面分别给可执行方案。

---

## 1. 游客 Demo / 公开 Workspace 预览

**目标**：未登录用户也能在 `/demo` 看到一段真实工作台体验，强化"这不是宣传"的可信度。

**方案**：做一个**只读的、本地状态驱动的演示版 Workspace**，不接 Supabase。

### 范围

| 功能 | 演示版做什么 |
|---|---|
| 进入 | 落地页加 `查看产品 Demo` 按钮 → `/demo` |
| 角色 | 默认演示账号"小李"，固定为兴通投行 IPO 项目 Day 1 |
| 聊天 | 预置 6–8 条 VP 对话脚本，按 setTimeout 顺序自动出现（含 typing dots） |
| 任务面板 | 显示真实任务名 + starter kit 链接（指向 `public/starter-kits/ibd/...`，本就是公开的） |
| 邮件 | 预置 1 封"任务派发"邮件，可点击展开 |
| 上传/提交 | 按钮显示但点击弹出 `注册后即可解锁` 提示，CTA 跳 `/register` |
| AI 反馈 | 预置一段标准答案 + 评分截图区，纯展示 |
| 导航条 | 沿用 marketing Navbar，不显示 Dashboard 按钮 |

### 文件改动

- 新建 `src/pages/Demo.tsx`：复用 `Workspace.tsx` 的视觉布局，但数据全部用本地常量（`src/data/demo-script.ts`）
- 新建 `src/data/demo-script.ts`：聊天/任务/邮件的 mock 数据
- `src/App.tsx`：注册公开路由 `/demo`（不在 ProtectedRoute 内）
- `src/components/marketing/Navbar.tsx`：未登录时多一个 `产品 Demo` 链接
- `src/pages/Landing.tsx`：Hero 第二个按钮 `查看运作方式` 旁加 `查看 Demo`

### 风险

- Workspace.tsx 当前耦合 useAuth / Supabase 较深，**不复用 Workspace 组件**，而是写一个简化版镜像组件。代码会有部分冗余，但安全、可控、不影响主流程。
- 工作量约：1 个新页面 + 1 个数据文件 + 2 处导航小改。

---

## 2. Stripe Webhook `Invalid time value` 调试

**现状**：webhook 已经做了三层时间戳防御（`isValidUnixTimestamp` → `coerceStripeTimestamp` → `unixTimestampToIso` 兜底），理论上不会再抛 `Invalid time value`。但用户仍报错，说明：

- 要么是**老的、错误时间戳已经写进了 DB**（脏数据），后续读出来时 `new Date()` 失败
- 要么是某个**新代码路径**（升级 / 单买 / past_due）在写 `expires_at` / `paid_at` 时被传入了错误值
- 要么是**前端**读 `current_period_end` 后做 `new Date()` 时失败，跟 webhook 无关

### 方案：分两步

**Step A — 取证**（先于改代码）
1. 在 Supabase Edge Function 日志面板里搜 `Invalid time value` 或 `[webhook]`，把最近 5 次的完整堆栈和时间戳值贴出来
2. 跑一段诊断 SQL（创建 read-only migration 或用 psql）：
   ```sql
   select id, stripe_subscription_id, current_period_start, current_period_end, status, created_at
   from public.subscriptions
   where current_period_start is null
      or current_period_end is null
      or current_period_start > current_period_end
   order by created_at desc limit 50;
   ```
3. 检查 `user_entitlements.expires_at` 是否有 `1970-01-01` 或 `null` 异常值

**Step B — 根据取证结果修**
- 如果是 DB 脏数据：写一个一次性 migration 把 `current_period_end` 异常的行重置为 `created_at + 30 days`，并把 `status` 标 `requires_review`
- 如果是新增代码路径：在 `assertDb` 之前加一道 `validateRow()`，所有写入前过一遍 `isValidUnixTimestamp` / `Date.parse` 校验
- 如果是前端：在 `useUserAccess` / Settings 等读取处包 `try-catch`，遇到无效日期显示 `—`

### 工作量

- Step A：纯查询 + 看日志，0 代码改动
- Step B：取决于 A 结果，1–3 个文件

**不能闭眼改**——会反复打地鼠。**建议你先去 Edge Function 日志面板抓一次完整报错堆栈**贴给我。

---

## 3. 首页真实产品截图替换

**现状**：你之前选的是"用 mock UI 强化"，所以这条本可以跳过。但如果想再上一个台阶，可以做**半自动方案**：

### 推荐方案：从 Demo 页截图

等 #1 的 `/demo` 做好后：
1. 用 `browser--screenshot` 工具去 `/demo` 截一张工作台全景
2. 用 `product-shot` skill 套一层 macOS 窗口框 + 渐变背景，输出 PNG
3. 把这张图替换 Landing 里现在的"工作台 mock 区块"，作为静态 hero 图
4. mock 区块降级成"运作方式"section 的小图

**优点**：截图就是真实产品（因为 Demo 用真实 Workspace 视觉），不需要美工
**缺点**：截图静态，不再有 hover/动画

### 备选

- 不改首页 hero，仅在 `/demo` 页做交互式预览，首页只加"查看 Demo"入口

---

## 推荐执行顺序

```
┌─ 1. Stripe webhook：先抓日志（你来做，不改代码）
│
├─ 2. /demo 游客预览（独立模块，不影响其他）
│
└─ 3. 用 demo 截图替换首页 hero（依赖 #2 完成）
```

## 需要你确认的事

1. **Demo 页**要不要现在就做？还是先观望
2. **Stripe webhook**：你能不能去 Supabase Edge Functions 日志里把最近一次的 `Invalid time value` 完整报错堆栈贴出来
3. **首页截图替换**：是否做，还是维持现在的 mock UI