

# RuHang 前端 UI 重构方案

## 设计系统

**主题 Token 重建：**
- 背景：深海军蓝 (`#0a1628` → `#0f1d32`)
- 强调色：金色 (`#c9a84c` → `#e2c275`)
- 卡片：半透明玻璃质感 (`rgba(255,255,255,0.04)` + `backdrop-blur`)
- 边框：微发光金色描边 (`rgba(201,168,76,0.15)`)
- 文字层级：白色标题 / 灰蓝正文 / 金色高亮
- 圆角统一 `12px`，阴影采用柔和发光

---

## 页面重构清单（共 9 个页面 + 配套组件）

### 1. Landing 首页 (`/`)
- **Navbar**：深色透明底 + 金色 logo + 导航项 + 登录/注册 CTA
- **Hero**：大标题 + 副标题 + 双 CTA + 右侧工作台预览 mockup
- **Stats Bar**：3-4 个金色数字统计（用户数/模拟数/通过率等）
- **三条模拟线卡片**：玻璃卡片 + icon + 难度标签 + 简介
- **How It Works**：3 步骤流程（注册 → 模拟 → 报告）
- **Why Real Training**：左右图文交替说明
- **CTA Section**：底部大 CTA
- **Footer**：链接 + 品牌信息 + 社交图标

### 2. Login (`/login`)
- 左右分栏：左侧品牌面板（logo + 标语 + 装饰）+ 右侧表单卡片
- 表单：email + password + 记住我 + 忘记密码链接 + 登录按钮 + 注册入口

### 3. Register (`/register`)
- 同 Login 布局，表单增加 name / confirm password
- 保留所有现有注册字段

### 4. Reset Password (`/reset-password`)
- 同 Auth 布局，单字段 email 表单

### 5. Dashboard (`/dashboard`)
- **顶栏**：欢迎语 + preferred_name + 快速操作
- **模拟线卡片区**：3 条线的状态卡（进行中/已完成/锁定），含进度条
- **快捷入口**：继续任务 / 查看报告 / 设置 / badge 入口
- **成就/勋章区**：横向滚动 badge 展示
- **能力沉淀提示**：简短文案 + 跳转 report
- **Pro/Free 状态标识**：卡片角标或顶部 banner

### 6. Workspace 工作台 (`/simulation/:id`)
这是最核心的重构：
- **三栏布局**：左侧会话列表 | 中间聊天/邮件区 | 右侧任务栏
- **左侧**：Leader / 项目组 / HR 会话列表，带头像 + 未读标记 + 角色颜色区分
- **中间**：
  - 顶部 tab 切换（聊天 / 邮件）
  - 消息区可滚动，输入框固定底部
  - 消息气泡区分自己 vs 对方（Leader/HR 不同颜色标记）
  - 文件上传按钮 + starter kit 下载卡
  - 邮件编辑器（收件人/主题/正文）
- **右侧任务栏**：
  - 当前任务列表 + 状态标记
  - 已完成任务可回看
  - 电话任务入口（骨架态）
  - Feedback 弹窗入口
- **弹窗系统**：
  - Feedback 弹窗：标准答案 / 详细解析 / 自评表单
  - Completion 弹窗：完成信 + 下一步引导

### 7. Offer 页面 (`/simulation/:id/offer`)
- 模拟正式 offer letter 风格
- 公司 logo + 职位信息 + 薪资 + 团队 + 开始日期
- "接受 Offer" CTA → 进入 workspace
- 专业 onboarding 感觉

### 8. Report (`/report`)
- **雷达图**：6 维能力评估
- **KPI 卡片**：关键指标 + 得分
- **Simulation 摘要**：时间线/里程碑回顾
- **能力建议**：基于评估的提升方向
- 整体像正式能力评估报告，不是图表 demo

### 9. Settings (`/settings`)
- **左右分栏**：左侧分区导航 + 右侧详情面板
- 五个分区：
  1. 账户（头像/姓名/邮箱/密码）
  2. 模拟偏好（preferred_name / feedback_style / reply_pacing）
  3. 通知设置
  4. 订阅与权益（当前 plan + 升级入口）
  5. 数据与隐私（数据导出/删除账户）

---

## 配套组件

- `Navbar.tsx` — 营销页导航
- `Footer.tsx` — 全站 Footer
- `TrackCard.tsx` — 模拟线卡片
- `AuthBrandPanel.tsx` — Auth 页品牌侧边栏
- `GlassCard.tsx` — 通用玻璃卡片
- `StatBar.tsx` — 数据统计条
- `BadgeCard.tsx` — 勋章展示卡
- Workspace 子组件：`ConversationList`, `ChatArea`, `EmailEditor`, `TaskPanel`, `FeedbackModal`, `CompletionModal`

---

## 接入说明

所有页面输出为纯 UI 壳 + 占位数据。业务逻辑（Supabase 查询、状态管理、AI 回复链路）用注释标记 `// TODO: 接入现有逻辑`，方便你和 Codex 合并时定位替换点。路由、schema、接口一律不改。

