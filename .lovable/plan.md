## 自查结论

这次问题不是按钮误触，也不是 `TaskFeedbackBar` 导致推进。

真正可疑点在 `Workspace.tsx` 的“状态恢复”逻辑：

```text
ensureActiveTask()
  把 active / feedback_pending / needs_resubmission 都当作 currentActive

syncProgressState()
  检测到 feedback_pending 会自动打开自评弹窗
```

之前为了防止“没有当前任务”而写的 `ensureActiveTask()`，会在某些加载/重渲染/数据库状态不同步场景下，把第一个非 done 任务当成 fallback，并写成 `active`。如果当前任务已经是 `feedback_pending`，而 `current_task_index` 或本地 `taskStatuses` 短暂不同步，就可能出现：

```text
提交任务成功 -> 当前任务 feedback_pending -> 保存自评
-> 状态同步 effect 再跑
-> ensureActiveTask 认为需要恢复当前任务
-> fallback 选到下一个未完成任务
-> 写入 active / current_task_index
-> UI 看起来像“自动开启下一个任务”
```

所以之前只移除推进按钮，方向不够彻底；自动开启不是来自按钮，而是来自“自动恢复 active task”的副作用。

## 修复方案

### 1. 停止把 `feedback_pending` 当成可恢复 active 状态

调整 `ensureActiveTask()`：

- `feedback_pending` 表示任务已经提交，正在等待自评/手动确认，不允许自动恢复或自动跳转。
- 如果存在任意 `feedback_pending`，直接返回这个 pending task，不写数据库，不更新 `current_task_index`，不激活下一任务。
- 只有在完全没有 `active`、没有 `feedback_pending`、没有 `needs_resubmission`，且确实是项目初始化/异常缺行时，才创建或恢复第一个任务为 `active`。

### 2. `current_task_index` 不再驱动自动开启下一任务

在 `ensureActiveTask()` 的 fallback 里增加保护：

- 如果数据库或本地存在 `feedback_pending`，绝不根据 `current_task_index` 去找下一个任务并激活。
- 如果 `current_task_index` 指向一个 locked/未创建的后续任务，也不自动把它改成 active，除非前序任务已经是 `done`。

### 3. 加前序任务完成校验，阻断越级激活

新增一个小函数，例如 `canActivateTask(task)`：

- 第一个任务可以在初始化时 active。
- 第 N 个任务只有当第 N-1 个任务状态为 `done` 时才允许被自动或手动激活。
- `feedback_pending` 不等于 `done`。

这样即使本地状态短暂错乱，也不会把下一任务自动打开。

### 4. 保留手动解锁，但加防重复/防自动调用保护

`finalizeTaskAndUnlock(task)` 仍保留，但加硬条件：

- 当前任务必须是 `feedback_pending`。
- 当前任务必须已有 `self_eval.submitted_at`。
- 函数只由确认弹窗调用。
- 如果不满足条件，直接 toast 提示并 return，不写入下一任务。

### 5. 修正误导性注释和弹窗关闭入口

- 更新旧注释中“在反馈弹窗里点击进入下一个任务”的描述，避免后续维护继续按错误思路改。
- 可选：把自评弹窗右上角 X 隐藏或接入同一个 `closeFeedbackModal`，避免用户以为“关闭弹窗”等同“进入下一任务”。

### 6. 验证

实现后检查：

- 全局只剩 `finalizeTaskAndUnlock` 一个真正写入下一任务 active 的函数。
- 保存自评只更新 `self_eval`，不更新 `status` / `current_task_index`。
- `ensureActiveTask` 遇到 `feedback_pending` 不做任何数据库写入。
- TypeScript 编译通过。

重点手测流程：

```text
提交任务通过
-> 自评弹窗打开
-> 保存自评
-> 弹窗不关闭
-> 不出现“下一个任务”toast
-> 关闭/刷新页面后仍停留在当前任务 feedback_pending
-> 只有点击右侧“完成并解锁下一任务”并二次确认后，才进入下一任务
```

<lov-actions>
<lov-open-history>View History</lov-open-history>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>