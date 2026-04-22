

# RuHang UI 重构方案：将 Lovable UI 设计接入 Codex 后端架构

## 核心思路

将当前 Lovable 项目的所有页面重写，使其：
1. **保留我设计的视觉风格**（深海军蓝 + 金色、玻璃卡片、层级感布局）
2. **完全采用 Codex 的后端架构**（`useAuth`、Supabase 查询、数据类型、`ProtectedRoute`、`AuthProvider`）
3. **使用 Codex 的真实内容**（项目名称、领导名字、勋章定义、赛道数据等）

重写完成后，你可以通过 GitHub Connector 将代码同步到 `KellyW527/RuHang_Final`，Vercel 会自动部署。

---

## 前置准备

### 1. 同步基础架构文件
从 RuHang_Final 引入以下关键模块（这些文件目前 Lovable 项目中不存在）：
- `src/lib/auth.tsx` — `AuthProvider`、`useAuth`、`Profile` 类型
- `src/lib/settings.ts` — `getPreferredDisplayName`、偏好/通知类型
- `src/lib/upload.ts` — 文件上传
- `src/lib/utils.ts` — 补充 `formatDeadline` 等工具函数
- `src/data/achievements.ts` — 勋章定义与状态构建
- `src/integrations/supabase/client.ts` — Supabase 客户端 + `supabasePublicConfig`

### 2. 更新设计系统
- `tailwind.config.ts`：合并 Codex 的 `surface-1/2`、`primary-glow/deep`、`success/warning` 等扩展色值，保留我的金色玻璃质感配置
- `src/index.css`：采用 Codex 的 V4 CSS 变量（`--surface-1`、`--glass-bg`、`--gradient-gold` 等），同时保留我的 `glass-card`、`glass-card-gold`、`glow-gold` 等工具类
- 字体：使用 `Noto Serif SC`（Codex 选用）替代 `Playfair Display`

### 3. 更新 App.tsx
- 引入 `AuthProvider` 包裹全局
- 引入 `ProtectedRoute` 保护 `/dashboard`、`/simulation/:id`、`/report`、`/settings` 等路由
- 引入 `ConfigErrorScreen` 处理环境变量缺失
- 路由路径完全不变

---

## 页面重写清单

### Landing (`/`)
- 保留我的视觉布局（Hero、Stats Bar、TrackCard、How It Works、Footer）
- 引入 `useAuth` 判断 `session` 存在时 CTA 指向 `/dashboard`
- 使用 Codex 的文案内容（"重塑金融人才培养方式"、"30+ 高校校园大使"、"已服务 8,000+ 学员"等）
- 添加 `framer-motion` 入场动画

### Login (`/login`)
- 保留左右分栏布局 + AuthBrandPanel
- 使用 Codex 的 `supabase.auth.signInWithPassword` 逻辑
- `useAuth` 检测已登录则跳转 `/dashboard`
- AuthBrandPanel 使用 Codex 版本的文案（AI 上级派活、标准答案 + 5 维评分、可沉淀的能力档案）

### Register (`/register`)
- 同 Login 布局，表单采用 Codex 的注册字段和 Supabase `signUp` 逻辑

### Reset Password (`/reset-password`)
- 保留布局，接入 Codex 的 `resetPasswordForEmail` 逻辑

### Dashboard (`/dashboard`)
这是改动最大的页面：
- **数据层**：完全使用 Codex 的 `SimRow` 类型、`user_simulations` + `tasks` + `user_task_progress` 查询链
- **侧边栏**：采用 Codex 的 `SidebarBody` 结构（导航、头像、plan 标识、退出），用我的玻璃卡片风格渲染
- **KPI 区**：展示推进中项目数、已结项数、累计完成任务、已点亮勋章
- **推荐项目区**：Spotlight 卡片展示当前进行中的模拟，含 `cover_emoji`、`track`、`company`、`role`、进度条
- **赛道矩阵**：`SimCard` 组件展示所有模拟线，保留 Offer 未接收 / 进行中 / PRO 锁定等状态
- **勋章区**：`MedalShelf` 弹窗展示真实勋章数据
- **快捷入口**：能力报告、我的勋章、设置中心、升级 PRO

### Workspace (`/simulation/:id`)
- 保留我的三栏布局框架（左侧会话列表 | 中间聊天/邮件 | 右侧任务栏）
- 接入 Codex 的完整 Workspace 逻辑（1380 行），包括：
  - 真实的任务加载、消息收发、邮件编辑
  - AI 回复链路、文件上传
  - Feedback 弹窗、Completion 弹窗
  - 任务状态管理
- 用我的玻璃卡片和金色主题重新包装所有子组件

### Offer Letter (`/simulation/:id/offer`)
- 保留专业 Offer 风格，接入 Codex 的真实数据

### Report (`/report`)
- 保留雷达图 + KPI 卡片布局
- 使用 Codex 的 `recharts` 数据查询（`user_task_progress` + `scoring_rubric` 维度聚合）
- 用我的视觉风格渲染

### Settings (`/settings`)
- 保留左右分栏导航
- 接入 Codex 的 5 个分区逻辑（账户、模拟偏好、通知、订阅、数据隐私）
- 使用 Codex 的 `normalizePreferences`、`applyFeedbackStyleTemplate` 等工具

### Pricing (`/pricing`)
- 保留现有设计，路由不变

---

## 技术注意事项

- 所有 `framer-motion` 动画从 Codex 版本中保留
- 安装缺失依赖：`framer-motion`、`recharts`（如尚未安装）
- `ProtectedRoute` 中 loading 状态显示品牌加载动画而非纯文字
- Supabase 环境变量需要在 Lovable 项目中配置（`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`）

---

## 交付方式

1. 在 Lovable 中完成所有页面重写
2. 通过 **Connectors > GitHub** 连接到 `KellyW527/RuHang_Final` 仓库
3. 代码自动同步，Vercel 自动部署
4. 如无法直接连接，则打包 ZIP 供手动合并

