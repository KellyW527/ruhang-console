## 目标

把"AI 能力"第一次接入到入行 RuHang，统一走你自部署的 MiMo（OpenAI 兼容）服务。两个落地场景：
1. **Workspace 对话回复**：NPC 同事/上级对学员发出的消息做实时回复，替代当前 `workspace-runtime.ts` 里硬编码的剧本回复。
2. **结业能力总结**：项目完成时，根据该用户在该项目里的全部任务、自评、提交内容，由 MiMo 生成一段中文能力画像，写入数据库并展示在证书/能力档案页。

不接入：任务自动评分、Pre/Post 问卷分析（保持现状）。

## 架构总览

```text
前端 (React)
  │  ① 用户在 Workspace 发消息 / 点 "生成能力总结"
  ▼
Supabase Edge Function: ai-proxy
  │  - 校验 JWT（用户必须登录）
  │  - 拼 system prompt + 上下文
  │  - 调 MiMo: ${MIMO_BASE_URL}/v1/chat/completions
  │  - 流式 SSE 透传给前端（对话场景）
  │  - 一次性 JSON（总结场景）
  ▼
你自部署的 MiMo (vLLM / SGLang / Ollama)
```

为什么走 edge function 而不是前端直连：
- MiMo 的 API Key / Base URL 不能暴露到浏览器
- 统一加 prompt 模板和敏感词兜底
- 方便后面替换成别的模型

## 需要的 Secrets（Lovable Cloud）

```
MIMO_BASE_URL          例如 https://mimo.your-domain.com   （不带 /v1）
MIMO_API_KEY           你部署时设置的 bearer token；没鉴权可填 "none"
MIMO_MODEL             例如 XiaomiMiMo/MiMo-7B-RL
```

部署完后再填 URL 也行——edge function 启动时只读 env，不写死。

## 实施方案

### 1. 新增 edge function `supabase/functions/ai-proxy/index.ts`

两个 action（用 query 参数 `?mode=chat` / `?mode=summary` 区分）：

**mode=chat**（流式 NPC 回复）
- 入参：`{ userSimulationId, taskId?, conversationId, history: [{role, content}], userMessage }`
- 拉一次 `tasks.title/description` + `simulations.company/track` 拼上下文
- system prompt 模板（中文）：
  > 你正在扮演 {company} 的 {role}，与一名实习生在办公 IM 上沟通…
- 透传 MiMo `stream:true` SSE 给前端
- 错误码：401 未登录 / 429 限流 / 502 上游错误，全部带 CORS

**mode=summary**（一次性能力画像）
- 入参：`{ userSimulationId }`
- 服务端聚合：`tasks` + `user_task_progress`（含 `self_eval`、`score`）+ `messages`（按 task 抓最近若干条用户文本）
- 给 MiMo 一段结构化 prompt，要求返回 JSON：
  ```json
  {
    "headline": "一句话能力定位",
    "strengths": ["…","…","…"],
    "improvements": ["…","…"],
    "skill_scores": [{"dim":"建模严谨度","score":85}, …],
    "summary_paragraph": "300 字以内的 narrative"
  }
  ```
- 用 `response_format: { type: "json_object" }` + 在 prompt 里强约束
- 写库：upsert 到新表 `simulation_ai_summaries`

### 2. 数据库迁移 `db/migrations/2026-04-28_add_ai_summary.sql`

```sql
create table public.simulation_ai_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_simulation_id uuid references public.user_simulations(id) on delete cascade not null unique,
  model text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.simulation_ai_summaries enable row level security;
create policy "own ai summary" on public.simulation_ai_summaries
  for select using (auth.uid() = user_id);
create policy "own ai summary insert" on public.simulation_ai_summaries
  for insert with check (auth.uid() = user_id);
```

写入由 edge function 用 service role 完成，但读取用 RLS 直接给前端。

### 3. 前端改动

**a) Workspace 对话**（`src/pages/Workspace.tsx`）
- 在用户发出 message 后，触发 `streamChat()` 调 `ai-proxy?mode=chat`
- 边收 token 边把 NPC 消息 append 到 `messages`，UI 展示打字效果
- 新建 helper `src/lib/ai.ts` 封装 SSE 解析（按 Lovable AI Gateway 的健壮解析模板）
- 保留 `workspace-runtime.ts` 的剧本作为 fallback：MiMo 报错时退回硬编码回复，保证 demo 不崩

**b) 结业能力总结**
- 在 `Certificate.tsx`（或上一轮要做的能力档案页）加载时：
  - 先 `select * from simulation_ai_summaries where user_simulation_id=…`
  - 没有就调 `ai-proxy?mode=summary` 触发生成（loading 态）
  - 生成完渲染：headline 大字 + strengths/improvements 双栏 + skill_scores 雷达 + 总结段落
- 提供 "重新生成" 按钮（限频：每 24h 一次，前端按 `created_at` 判定）

### 4. 配置

`supabase/config.toml` 加：

```toml
[functions.ai-proxy]
verify_jwt = true
```

### 5. 文档

更新 `supabase/functions/README.md`，在底部追加 ai-proxy 部署 + secret 说明。

## 不在本次范围

- 不接 Lovable AI Gateway，全程走你自己的 MiMo
- 不做提示词运营后台（system prompt 先写死在代码，方便后续 PR 调）
- 不替换 Pre/Post 问卷的统计逻辑
- 不做对话历史向量化/RAG，对话上下文用最近 N 条原文

## 风险与对策

| 风险 | 对策 |
|------|------|
| MiMo 服务挂掉 → 用户对话卡住 | 5s 超时 + fallback 到 `workspace-runtime.ts` 剧本 |
| MiMo 输出非 JSON 导致总结解析失败 | summary 模式重试 1 次；仍失败则把原始文本存到 `payload.raw` 并显示降级 UI |
| MiMo 自部署带宽有限 | edge function 加简单内存级 IP 限流（每用户 1 req/3s） |
| 中文质量 | system prompt 显式要求"用大陆中文金融术语" |

## 涉及文件

- 新增：`supabase/functions/ai-proxy/index.ts`
- 新增：`db/migrations/2026-04-28_add_ai_summary.sql`
- 新增：`src/lib/ai.ts`（SSE 解析 + summary 调用封装）
- 修改：`src/pages/Workspace.tsx`（对话回复改成 MiMo 流式）
- 修改：`src/pages/Certificate.tsx`（加载 / 生成 AI 总结块）
- 修改：`supabase/config.toml`、`supabase/functions/README.md`
- 之后通过 add_secret 让你录入 `MIMO_BASE_URL` / `MIMO_API_KEY` / `MIMO_MODEL`
