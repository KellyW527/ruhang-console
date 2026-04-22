

## 修复：配置 Supabase 环境变量 + 提交流程解耦 + feedback_pending 自动处理

### 变更 1 — 设置 Supabase 环境变量

在项目中配置：
- `VITE_SUPABASE_URL` = `https://xhkthstyxqbqymwvrdgb.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_5jpoJ0TMx-PBqZjddhLADA_Bw9ISCZV`

这将使所有数据库操作（邮件插入、任务状态更新等）恢复正常。

### 变更 2 — 解耦邮件存储与提交逻辑

**文件**: `src/pages/Workspace.tsx`

在 `sendCompose` 函数中（约第 1240 行），当邮件插入 `emails` 表失败时，不再直接 `return`。改为：记录错误并继续执行后续的 `triggerSubmission` 调用，确保即使邮件存储失败，提交流程仍然能触发反馈和解锁。

```
// 改前：
if (error || !inserted) { ... return; }

// 改后：
if (error) {
  console.error("邮件存储失败（不阻塞提交流程）:", error);
  toast.warning("邮件记录未保存，但提交将继续处理");
}
// 继续执行 triggerSubmission
```

### 变更 3 — feedback_pending 状态自动切换到自评标签页并解锁下一任务

**文件**: `src/pages/Workspace.tsx`

当 `triggerSubmission` 发现任务已处于 `feedback_pending` 状态时（第 878-886 行），当前只是弹 toast 并打开反馈弹窗。改进为：

1. 调用 `openFeedbackForTask` 后，自动将 `feedbackTab` 切换到 `"self-eval"` 标签页（而非 `"answer"`），让用户直接进入自评界面。
2. 在 `openFeedbackForTask` 中增加一个可选参数 `defaultTab`，支持指定打开时的默认标签页。

### 技术细节

- `openFeedbackForTask` 签名改为 `(task: Task, defaultTab?: string)`，默认值 `"answer"`
- 在 `feedback_pending` 分支中调用 `openFeedbackForTask(pendingTask, "self-eval")`
- 自评完成后（`SelfEval` 的 `onSaved` 回调），自动调用 `advance()` 完成 `finalizeTaskAndUnlock`，解锁下一任务

