# 第一批修复方案（🟢 全部为简单改动）

按 Hermes 报告里的 P0 项整理。所有改动都是文案 / 元信息 / 单文件级，不动数据流、不动支付、不动聊天对齐。

---

## 1. SEO & 浏览器标题（`index.html`）

**问题**：title / description / og 还是 `Lovable App / Lovable Generated Project`，`html lang="en"`。

**改动**：
- `<html lang="en">` → `<html lang="zh-CN">`
- `<title>` → `入行 RuHang｜金融岗位真实任务模拟平台`
- `<meta name="description">` → `通过真实岗位任务、资料包和成果交付，模拟投行、PE、研究、并购等金融职业工作流，帮助学生提前积累实战经验与作品集。`
- `<meta name="author">` → `RuHang`
- `og:title` / `og:description` 同步更新
- 新增 `<link rel="canonical" href="https://ruhang-console.vercel.app/" />`
- og:image 暂时保留现有 lovable 默认图（没有自有图就先不动，避免 404）

---

## 2. 首页"赛道"锚点失效（`src/pages/Landing.tsx`）

**问题**：Navbar 的 `<a href="#tracks">` 指向不存在的 id。

**改动**：在 Landing.tsx 第 160 行 `<section className="relative py-20">` 上加 `id="tracks"`。

---

## 3. 页脚法律链接（`src/components/marketing/Footer.tsx` + 新建两个页面）

**问题**：`隐私政策` / `服务条款` 都是 `href="#"`；`/privacy` `/terms` 直接 404。

**改动**：
- 新建 `src/pages/Privacy.tsx` —— 静态中文隐私政策（占位但完整：信息收集、使用、Cookie、第三方 Stripe/Supabase、用户权利、联系方式、生效日期），用 Navbar + Footer 包壳，沿用深色金融风。
- 新建 `src/pages/Terms.tsx` —— 静态中文服务条款（账号规则、付费与退款、内容版权、AI 生成内容免责、模拟性质免责、禁止行为、终止、生效日期）。
- `src/App.tsx` 注册两条 public 路由：`/privacy` `/terms`。
- `Footer.tsx` 把两个 `<a href="#">` 换成 `<Link to="/privacy">` `<Link to="/terms">`。

---

## 4. 注册页协议变成可点击链接（`src/pages/Register.tsx`）

**问题**：`创建账号即代表你同意《用户协议》与《隐私政策》` 是纯文本。

**改动**：把那段提示拆成带 `<Link to="/terms">《用户协议》</Link>` 和 `<Link to="/privacy">《隐私政策》</Link>` 的 inline 链接，加 `text-primary hover:underline`。

> 注：是否加显式勾选框属于 P1，本批不做。

---

## 5. 登录失败错误提示中文化（`src/pages/Login.tsx`）

**问题**：失败时 `toast.error("登录失败", { description: error.message })` 把 Supabase 英文原文直接吐出来；空字段没字段级提示。

**改动**：
- 加一个 `mapAuthError(error.message)` 函数，把常见 Supabase 错误映射成中文：
  - `Invalid login credentials` → "邮箱或密码错误，请检查后重试"
  - `Email not confirmed` → "请先完成邮箱验证后再登录"
  - `Too many requests` → "尝试次数过多，请稍后再试"
  - 其它 → "登录失败，请稍后重试"
- 提交前若 `email` / `password` 为空 → `toast.error("请填写邮箱和密码")` 并 return。
- 按钮 loading 文案保留 `登录中...`（已有）。

同样的映射逻辑顺带也用在 `Register.tsx` 的 `signUp` 错误上（常见：`User already registered` → "该邮箱已注册，请直接登录"）。

---

## 6. 忘记密码错误中文化（`src/pages/ResetPassword.tsx`）

**问题**：空邮箱时 Supabase 返回 `Password recovery requires an email`。

**改动**：
- 提交前若 `email` 为空 → `toast.error("请输入注册邮箱")` 并 return。
- `error` 时也走中文映射（`For security purposes...` → "操作过于频繁，请稍后再试"）。
- placeholder `yourname@school.edu.cn` → `yourname@example.com`（避免误导必须用校园邮箱）。

---

## 7. 404 页面中文化 + 品牌化（`src/pages/NotFound.tsx`）

**问题**：英文默认 + 无品牌 + 无导航。

**改动**：整页重写：
- 套 Navbar + Footer
- 居中大字 `404`（用 `text-gradient-gold` + `font-display`）
- 副标题：`页面未找到`
- 描述：`抱歉，你访问的页面不存在、已被移动或链接有误。`
- 三个按钮：
  - `返回首页` → `/`
  - `进入控制台` → `/dashboard`（未登录会被 ProtectedRoute 自动拦到 login，行为合理）
  - `查看赛道` → `/#tracks`
- 保留 `console.error` 调试日志。

---

## 8. 定价页 toast 改进（`src/pages/Pricing.tsx`，小改）

**问题**：报告说"未登录点付费按钮无反馈"。读代码发现其实**已经**有 `toast.info("请先登录") + navigate("/login?redirect=/pricing")`，只是 toast 时间太短可能没看见，且 `?redirect=` 当前并没有被 Login 页处理。

**改动**：
- `toast.info` 加 `duration: 4000`，提示文案改成 `请先登录或注册后再选择套餐`。
- `Login.tsx` 登录成功后读取 `useSearchParams().get("redirect")`，如果有就跳到该路径，否则跳 `/dashboard`。Register 同样处理。

---

## 不在本批内的事项（明确列出避免遗漏）

下列 Hermes 指出的项 **本次不动**，等下一批：
- 首页首屏加产品截图 / 改 slogan / 增加"你会产出什么"模块（🟡 内容工作）
- 定价页对比表 + FAQ Accordion（🟡）
- 注册页显式勾选框（🟡）
- Stripe webhook 的 `Invalid time value`（🔴 需另查 payload）
- 公开 Demo / 游客预览（🔴）
- 中英文术语规范、对比度全面 audit（🟢 但量大，单独排一批）

---

## 影响范围与风险

- 涉及文件：`index.html`、`src/App.tsx`、`src/pages/Landing.tsx`、`src/pages/Login.tsx`、`src/pages/Register.tsx`、`src/pages/ResetPassword.tsx`、`src/pages/NotFound.tsx`、`src/pages/Pricing.tsx`、`src/components/marketing/Footer.tsx`，新增 `src/pages/Privacy.tsx`、`src/pages/Terms.tsx`。
- 不动：聊天/工作台、Supabase schema、Edge Functions、支付逻辑、Auth Provider。
- 风险：极低。最大的"新增"是两个静态法律页，纯渲染没副作用。

确认后我就开始实施这一批。
