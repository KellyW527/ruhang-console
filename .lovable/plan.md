## 任务 1：底部添加"合作联系"

### 修改 `src/components/marketing/Footer.tsx`

把当前 4 列网格改成 5 列（`md:grid-cols-5`），新增"合作联系"列，放在"法律"之前（或末尾）。

新增列内容：

- 标题：**合作联系**
- 一段说明（小字 muted）：面向企业、机构和有金融行业经验的前辈，开放三类合作
- 三条要点（图标 + 一行）：
  1. **定制化项目授权** — 与我们共建专属赛道任务
  2. **人才数据访问权限** — 经学员授权后获取完成度优秀的学员名单，定向发送面试邀请
  3. **人才漏斗转化** — 完成模拟任务的学生具备更强意向与基础技能，帮助企业前置筛选
- 一个邮件 CTA 链接：
  ```
  邮箱：3165784931@qq.com（标题"合作联系"）
  ```
  使用 `<a href="mailto:3165784931@qq.com?subject=合作联系">` 形式，hover 高亮 primary 金色，与现有链接风格一致。

样式沿用 footer 现有的 `text-sm text-muted-foreground hover:text-primary`，标题用 `text-sm font-semibold text-foreground font-sans`，与其他列对齐。

> 移动端：5 列在窄屏会被 `grid-cols-1` 自动堆叠，无需额外处理。

---

## 任务 2：项目完成时询问是否公开成果给发起人/公司

### 2.1 数据库迁移

新建 `db/migrations/2026-04-27_add_post_survey_share_consent.sql`：

```sql
ALTER TABLE public.post_simulation_surveys
  ADD COLUMN IF NOT EXISTS share_with_partner BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_consent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_post_survey_share
  ON public.post_simulation_surveys(simulation_code, share_with_partner)
  WHERE share_with_partner = true;
```

含义：
- `share_with_partner = true` → 用户同意公开（可被发起人/合作方筛选）
- `share_with_partner = false`（默认）→ 保密
- `share_consent_at` 记录同意时间，便于后续合规追溯

### 2.2 前端：在出项问卷里加一道"公开同意"题

修改 `src/components/feedback/PostSimulationSurvey.tsx`：

- 在"开放题"和提交按钮之间，新增一个卡片："是否愿意将本次项目结果公开给发起方/合作公司？"
- 文案要点：
  - 好处：让发起方/合作公司看到你的完成情况，有机会被联系面试、收到内推等
  - 不公开：仅你和 RuHang 可见，不会被任何第三方查到
- 两个互斥按钮：**愿意公开** / **保持保密**（默认未选；必须二选一才能提交，与其他必填项一致）
- 新增 state：`shareWithPartner: boolean | null`
- `isValid` 增加条件：`shareWithPartner !== null`

### 2.3 写库链路

修改 `src/lib/feedback.ts`：

- `PostSurveyPayload` 增加字段 `shareWithPartner: boolean`
- `submitPostSimulationSurvey` 在 insert 时写入：
  - `share_with_partner: payload.shareWithPartner`
  - `share_consent_at: payload.shareWithPartner ? new Date().toISOString() : null`

`PostSimulationSurvey.tsx` 提交时把 `shareWithPartner` 透传给 `submitPostSimulationSurvey`。

### 2.4 不影响现有完成流程

- 不改 `Workspace.tsx` / `Certificate.tsx` 的入口与时序
- 不改其他自动推进/自评相关逻辑（之前已修复，保持原样）

---

## 验证清单

- 底部新增"合作联系"列，邮箱 `mailto:` 可点击，标题预填"合作联系"
- 移动端 footer 不错位
- 出项问卷新增"是否公开"题，未选不能提交
- 选"愿意公开"后，`post_simulation_surveys` 行 `share_with_partner=true` 且 `share_consent_at` 有时间戳
- 选"保持保密"后，`share_with_partner=false`、`share_consent_at` 为 null
- 用户需要在 Lovable Cloud 里执行新迁移 SQL
