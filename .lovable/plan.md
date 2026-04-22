
## 当前最可能的问题

### 1) `feedback_pending` 自动切到“自我评估”被现有 effect 覆盖了
**文件**: `src/pages/Workspace.tsx`

虽然 `triggerSubmission` 里已经调用了：
- `openFeedbackForTask(pendingTask, "self")`

但当前还有一个 effect：

- `useEffect(() => { if (!feedbackTask) return; setFeedbackTab("answer"); ... }, [feedbackTask])`

这会在每次打开反馈弹窗时，**强制把 tab 重置回 `"answer"`**，把刚设置的 `"self"` 覆盖掉。  
所以现在“自动进入自评页”的逻辑实际上没有生效。

---

### 2) 自评保存后并没有自动执行解锁
**文件**: `src/pages/Workspace.tsx`

当前 `SelfEval` 的 `onSaved` 只做了：

- `setSelfEvalMap(...)`

但**没有调用 `advance()`**，所以即使用户完成自评，下一任务也不会自动解锁。  
现在的代码仍然要求用户手动点弹窗底部按钮“进入下一个任务”。

这和你要求的“完成自评后自动解锁下一任务”还不一致。

---

### 3) `syncProgressState` 逻辑还没真正补完
**文件**: `src/pages/Workspace.tsx`

当前这个函数只做了：

- 找到 `feedback_pending` 任务
- `setFeedbackTab("answer")`
- `setFeedbackTask(...)`

然后如果 `readyToUnlock` 为真，就直接结束，没有继续调用：

- `finalizeTaskAndUnlock(...)`

所以页面刷新、重新进入项目、或者状态已经是 `feedback_pending` 时，这段恢复逻辑**不会自动完成解锁**。

---

### 4) 邮件任务如果没有合法附件，仍然会被判定为 `retry`
**文件**: `src/data/workspace-runtime.ts`

`evaluateSubmission()` 现在的通过条件仍然是：

- 有“正式提交”
- 且扩展名命中 `allowedExtensions`

也就是说：
- 纯正文邮件
- 主题没有扩展名
- 或附件扩展名不匹配

都会继续进入 `retry`，不会进入 `feedback_pending`，自然也不会进入自评和解锁链路。

如果你测试时邮件没有真正挂上 `.xlsx/.csv/.docx/.pdf/.md` 这类允许格式，当前逻辑依然会卡住。

---

## 这次建议的修复方案

### 变更 1 — 保留 `defaultTab`，不要再强制重置成 `"answer"`
**文件**: `src/pages/Workspace.tsx`

调整反馈弹窗相关状态逻辑：

- 新增一个 `feedbackDefaultTab` / `pendingFeedbackTab` 状态，或让 `openFeedbackForTask` 成为唯一设置 tab 的入口
- 删除/改写 `feedbackTask` 变化时无条件 `setFeedbackTab("answer")` 的 effect
- 这样 `openFeedbackForTask(task, "self")` 才会真正生效

**目标结果**：
- 任务已是 `feedback_pending` 时，再次提交会直接打开“自我评估”页
- 不再被 effect 改回“标准答案”

---

### 变更 2 — 自评保存成功后立即自动解锁下一任务
**文件**: `src/pages/Workspace.tsx`

把 `SelfEval` 的 `onSaved` 从：

- 只更新 `selfEvalMap`

改成：

1. 更新本地 `selfEvalMap`
2. 调用 `advance()`
3. `advance()` 内部执行 `finalizeTaskAndUnlock(feedbackTask)`

**目标结果**：
- 用户点击“保存评估”后，不需要再手动点“进入下一个任务”
- 当前反馈弹窗自动关闭
- 下一任务自动变成 active
- 任务栏与 leader 会话同步进入下一题

---

### 变更 3 — 补全 `syncProgressState` 的恢复链路
**文件**: `src/pages/Workspace.tsx`

改造 `syncProgressState()`：

- 若存在 `feedback_pending` 且还没自评：
  - 打开反馈弹窗
  - 默认切到 `"self"`
- 若存在 `feedback_pending` 且已经有 `self_eval.submitted_at`：
  - 直接调用 `finalizeTaskAndUnlock(pendingTask)`
  - 避免用户刷新后卡死在“待反馈”

同时加一个保护，避免重复执行解锁：
- 使用 `syncingProgressRef`
- 进入时置 true，结束后恢复 false

**目标结果**：
- 即使用户关闭过弹窗、刷新过页面、重新进入项目，也能恢复正确状态
- 不会长期停留在 `feedback_pending`

---

### 变更 4 — 仅在前 3 项修复后仍失败时，再处理邮件判定
**文件**: `src/data/workspace-runtime.ts`

如果前 3 项修完后仍无法进入反馈，再补这个兼容：

- 对 `expectedSubmissionKind === "email"` 的任务区分两类：
  1. **严格附件型任务**：仍要求合法附件扩展名
  2. **正文可评估型任务**：允许正文足够完整时通过

但按照你这次要求，先不动这一层，优先保留“邮件专用提交”的严格规则。

---

## 实施顺序

1. 修掉 `feedbackTask -> setFeedbackTab("answer")` 的覆盖问题  
2. 自评保存后接入 `advance()` 自动解锁  
3. 补全 `syncProgressState()`，处理刷新/回到页面时的恢复  
4. 只有前 3 步仍不生效时，再调整 `evaluateSubmission()` 的邮件判定逻辑

---

## 预期修复后的行为

```text
邮件发送成功
  → triggerSubmission
  → 状态写入 feedback_pending
  → 自动打开反馈弹窗
  → 自动切到“自我评估”
  → 用户保存自评
  → 自动 finalizeTaskAndUnlock
  → 下一任务自动激活
```

---

## 涉及文件

- `src/pages/Workspace.tsx`
- 如仍需补最后一层兼容，再改：
  - `src/data/workspace-runtime.ts`
