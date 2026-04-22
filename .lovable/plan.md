
目标：这次只收口“提交后反馈界面打不开 / 自评后无法解锁下一任务 / 右侧预览直接报错”这一条链路，不再扩散到其他功能。

## 当前最可能的剩余根因

1. `finalizeTaskAndUnlock()` 仍在写 `feedback_seen`
   - 文件：`src/pages/Workspace.tsx`
   - 当前代码里 `user_task_progress` 只剩这一处还写 `feedback_seen`
   - 之前已经出现过 `review_summary` 列不存在导致整段更新失败，这里很像同类问题
   - 一旦这步失败，当前任务不会真正变成 `done`，下一任务也不会稳定解锁

2. 解锁链路仍然没有逐步检查 Supabase 错误
   - `finalizeTaskAndUnlock()` 里连续执行：
     - 当前任务改 `done`
     - 下一任务插入/更新 `active`
     - `user_simulations.current_task_index` 更新
   - 目前几乎都没检查 `error`
   - 所以即使数据库失败，前端也可能局部更新，表现成“看起来点了，但没解锁”

3. `SelfEval` 仍然是纯 `update`
   - 文件：`src/components/workspace/SelfEval.tsx`
   - 如果当前任务的 `user_task_progress` 行缺失，`update(...).eq(...)` 可能不会真正写入
   - 前端会显示“已保存”，但数据库没有 `self_eval`，刷新后又卡回去

4. 反馈弹窗入口仍未完全统一
   - 文件：`src/pages/Workspace.tsx`
   - 现在还残留直接 `setFeedbackTask(t)` 的入口
   - 这会绕过默认 tab 逻辑，导致有的入口是自评，有的入口不是，甚至可能触发不一致的渲染状态

5. 反馈弹窗本身缺少兜底渲染保护
   - 当前有多处直接使用 `feedbackTask.scoring_rubric.map(...)`
   - 如果某个任务数据不完整，打开反馈弹窗时会直接把整个工作台打崩
   - 这和你截图里的“整个 preview 报错”现象是匹配的

## 实施方案

### 变更 1 — 先修解锁主链路里的潜在 schema 失配
文件：`src/pages/Workspace.tsx`

处理方式：
- 从 `finalizeTaskAndUnlock()` 的 `update({ ... })` 里移除 `feedback_seen`
- 只写当前代码已明确在其他地方使用、并且已存在的字段：
  - `status`
  - `score`
  - 如有必要再保留 `submitted_at` / `self_eval` 等已在读取中的字段
- 如果确实需要“已看反馈”概念，后续单独走 schema 变更；这轮先不继续写不存在的列

目标结果：
- 避免再次出现“因为一个不存在的列，整段 done/update 全部失败”

### 变更 2 — 给 `finalizeTaskAndUnlock()` 加完整错误检查
文件：`src/pages/Workspace.tsx`

按步骤补强：
1. 当前任务改 `done`：检查 `error`
2. 若当前任务 progress 行不存在：先补行，再继续
3. 下一任务插入/更新 `active`：检查 `error`
4. 更新 `user_simulations.current_task_index`：检查 `error`
5. 成功后同步本地：
   - `upsertTaskStatus(task.id, { status: "done" ... })`
   - `upsertTaskStatus(nextTask.id, { status: "active" })`
   - `setCurrentTaskIndex(nextTask.order_index)`

失败时统一：
- `console.error("[unlock]", step, error)`
- `toast.error("任务解锁失败，请重试")`
- 不再静默失败

目标结果：
- 解锁失败时能准确知道卡在哪一步
- 本地状态与数据库状态不再长期分叉

### 变更 3 — 把 progress 行保证逻辑抽成统一 helper
文件：`src/pages/Workspace.tsx`
必要时联动：`src/components/workspace/SelfEval.tsx`

新增统一逻辑，例如：
- `ensureTaskProgressRow(taskId, status?)`

用途：
- `triggerSubmission()` 前先确保当前任务行存在
- `finalizeTaskAndUnlock()` 前确保当前任务行存在
- `SelfEval.save()` 前确保当前任务行存在；若不存在则插入再写 `self_eval`

目标结果：
- 历史脏数据、初始化漏写、测试账号旧数据都不会再导致“前端已进入下一步，但数据库没记录”

### 变更 4 — 收敛所有反馈入口到 `openFeedbackForTask`
文件：`src/pages/Workspace.tsx`

统一替换这些入口：
- 任务列表里的 `setFeedbackTask(t)`
- done 回看入口里的 `setFeedbackTask(t)`
- 任何 retry / pending / review 场景下的直接打开逻辑

统一规则：
- `feedback_pending` → `openFeedbackForTask(task, "self")`
- `needs_resubmission` → `openFeedbackForTask(task, "answer")`
- `done` 回看 → `openFeedbackForTask(task, "answer")`

目标结果：
- 不再出现“有时能看到自评，有时打开就不对劲”的不一致行为

### 变更 5 — 给反馈弹窗加数据兜底，防止整个页面报错
文件：`src/pages/Workspace.tsx`

渲染层做保护：
- `const scoringRubric = Array.isArray(feedbackTask?.scoring_rubric) ? feedbackTask.scoring_rubric : []`
- 所有 `.map(...)` 改为基于兜底数组
- `standard_answer`, `boss_commentary`, `reference.analysis` 都加空值 fallback
- `SelfEval` 的 `dimensions` 也基于兜底后的 rubric 生成

目标结果：
- 即使某个任务数据不完整，也只会显示空状态，不会把整个预览打崩

### 变更 6 — 最小必要日志，专门跟这条状态机
文件：`src/pages/Workspace.tsx`
必要时联动：`src/components/workspace/SelfEval.tsx`

仅加这几类日志：
- `triggerSubmission`: task id、原状态、evaluation result、目标状态
- `openFeedbackForTask`: task id、tab
- `SelfEval.save`: task id、是否命中 existing row、save 成功/失败
- `finalizeTaskAndUnlock`: done 更新、next active、current_task_index 更新
- `syncProgressState`: pending 发现、自评已存在/不存在、是否触发 finalize

目标结果：
- 如果修完仍有问题，下一轮可以直接根据日志定位，而不是继续猜

## 验证范围

1. 登录后在右侧 preview 里复测一条 pass 链路
   - 正式提交
   - 自动打开反馈弹窗
   - 默认落在“自我评估”
   - 保存后自动解锁下一任务

2. 刷新页面后复测恢复逻辑
   - `feedback_pending + 未自评`：重新打开自评
   - `feedback_pending + 已自评`：自动完成 finalize 并恢复下一任务

3. 复测 retry 链路
   - 只打开反馈
   - 不解锁下一任务
   - 不触发自评保存后的推进

4. 复测 done 回看入口
   - 可以正常打开反馈弹窗
   - 不再让 preview 整页报错

## 涉及文件

- `src/pages/Workspace.tsx`
- `src/components/workspace/SelfEval.tsx`
