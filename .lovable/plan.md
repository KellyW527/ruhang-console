
目标：只针对“提交后看不到反馈 / 无法自动解锁下一任务”这个链路做一次更彻底的修复，不再继续扩散到别的问题。

## 现在最可能还没修透的地方

### 1) 成功提交后，代码仍然把反馈弹窗强制打开到 `answer`
虽然 `feedback_pending` 分支已经会 `openFeedbackForTask(pendingTask, "self")`，但首次成功提交时，`triggerSubmission()` 里现在仍然是：

- 立即 `openFeedbackForTask(activeTaskNow)`（默认就是 `"answer"`）
- 320ms 后又 `openFeedbackForTask(activeTaskNow)` 一次（还是 `"answer"`）

这会把本来应该进入“自我评估”的路径重新覆盖掉。  
也就是说，前面修掉了 `useEffect` 覆盖 tab，但提交成功主链路本身还在覆盖。

### 2) 还有多个入口直接 `setFeedbackTask(t)`，没有走统一的打开逻辑
当前代码里除了 `openFeedbackForTask(...)`，还有这些入口直接：

- `setFeedbackTask(t)`（任务列表/回看入口）
- `setFeedbackTask(activeTaskNow)`（retry 分支）

这样会导致：
- 有的入口记得切 tab
- 有的入口不切
- 表现不一致，用户会觉得“有时能看，有时什么都没有”

### 3) 解锁逻辑对数据库失败几乎没有防护
`finalizeTaskAndUnlock()` 里连续做了多次 Supabase 更新/插入，但目前基本没有逐步检查错误：

- 当前任务改 `done`
- 下一任务插入/改 `active`
- `user_simulations.current_task_index` 更新

如果其中任一步失败，UI 可能局部更新，但实际任务没解锁；或者刷新后又回到旧状态。

### 4) `user_task_progress` 行缺失时，提交和解锁都可能“看起来执行了，实际上没落库”
`triggerSubmission()` 现在对 `user_task_progress` 用的是 `update(...).eq(...)`。  
如果当前任务那一行根本不存在，`update` 可能不会真正写入任何记录，但本地 `upsertTaskStatus(...)` 仍会更新前端状态，造成：

```text
前端看起来改成 feedback_pending
但数据库没这行
→ 自评保存 / 解锁 / 刷新恢复 全部会不稳定
```

---

## 这次建议的修复

### 变更 1 — 把“打开反馈弹窗”收敛成唯一入口
文件：`src/pages/Workspace.tsx`

统一规则：
- 所有打开反馈的地方都必须走 `openFeedbackForTask(task, tab)`
- 不再直接 `setFeedbackTask(...)` 作为业务入口
- 按状态决定默认 tab：
  - `feedback_pending` → `"self"`
  - `needs_resubmission"` → `"answer"`
  - `done` 回看 → `"answer"`

需要替换的入口包括：
- `triggerSubmission()` 的 pass / retry 分支
- 任务列表上的“查看反馈 / 回看反馈”
- 侧边栏任何直接打开反馈的按钮

目标结果：
- 无论用户从哪里进入反馈，表现一致
- 不会再出现“某些入口没切到自评页”的问题

---

### 变更 2 — 修正首次成功提交后的默认行为
文件：`src/pages/Workspace.tsx`

把 `triggerSubmission()` 成功通过后的逻辑改成：

- 提交通过后直接 `openFeedbackForTask(activeTaskNow, "self")`
- 删除那段 320ms 后再次 `openFeedbackForTask(activeTaskNow)` 的定时覆盖
- retry 才打开 `"answer"`

目标结果：
```text
首次提交成功
→ 状态变 feedback_pending
→ 反馈弹窗直接打开
→ 默认落在“自我评估”
```

---

### 变更 3 — 给 `finalizeTaskAndUnlock()` 增加完整的错误检查和兜底
文件：`src/pages/Workspace.tsx`

补强解锁链路：

1. 当前任务改 `done` 时检查 `error`
2. 如果当前任务 progress 行不存在，先补一行再继续
3. 下一任务插入 / 更新 `active` 时检查 `error`
4. 更新 `user_simulations.current_task_index` 时检查 `error`
5. 任一步失败都：
   - `console.error(...)`
   - 给用户清晰 toast
   - 不要静默失败

目标结果：
- 解锁失败时能准确知道卡在哪一步
- 不会再出现“看起来点了保存，但下一任务没开”的黑盒状态

---

### 变更 4 — 把“提交当前任务状态”改成真正的 upsert 思路
文件：`src/pages/Workspace.tsx`

在 `triggerSubmission()` 中，不再假设当前任务一定已有 `user_task_progress` 记录。  
改成：

- 先查询当前任务 progress 行
- 有则 update
- 没有则 insert 一行（状态直接写成 `feedback_pending` 或 `needs_resubmission`）

目标结果：
- 即使历史数据不完整、之前初始化漏写、或者测试环境已有脏数据，也不会因为缺行而导致反馈/解锁链路失效

---

### 变更 5 — 增加最小必要日志，专门追这条状态机
文件：`src/pages/Workspace.tsx`

只给这几个关键点加日志：
- `triggerSubmission`：提交前状态、判定结果、目标状态
- `openFeedbackForTask`：task id + tab
- `SelfEval onSaved`：task id
- `finalizeTaskAndUnlock`：当前任务 done、下一任务 active、current_task_index 更新结果
- `syncProgressState`：发现 pending / readyToUnlock 的判定

目标结果：
- 如果这次修完还有问题，下一轮能直接从日志定位，不再靠猜

---

## 本次不优先改的部分

### 邮件判定规则
`workspace-runtime.ts` 里的邮件放行逻辑现在已经允许有主题的 email 通过，短期内它不再是最优先怀疑点。  
本轮先不继续改提交标准，先把“状态写入 → 反馈打开 → 自评保存 → 解锁下一任务”这条状态机做稳定。

---

## 预期修复后的行为

```text
发送邮件 / 正式提交
  → triggerSubmission 写入或补建当前任务 progress
  → 状态改为 feedback_pending
  → 反馈弹窗统一通过 openFeedbackForTask(..., "self") 打开
  → 用户保存自评
  → finalizeTaskAndUnlock 严格检查并完成：
       - 当前任务 done
       - 下一任务 active
       - current_task_index 前进
  → 弹窗关闭
  → 下一任务立即激活
```

---

## 涉及文件

- `src/pages/Workspace.tsx`

如这轮修完仍异常，再继续检查：
- `src/components/workspace/SelfEval.tsx`（只在需要补更细日志或状态回调时）
