## 问题原因

`src/pages/Workspace.tsx` 里聊天列表的外层容器是:

```tsx
<div className="mx-auto max-w-4xl space-y-4">
  {messages.map((m) => <MessageBubble ... />)}
</div>
```

而每个 `MessageBubble` 渲染出来的根元素形如:

```tsx
<div className="flex max-w-[85%] ml-auto">…</div>
```

由于父容器**不是 flex 容器**,`ml-auto` 对块级子元素无效——子 div 实际上是块级元素并占据父容器的一行,`max-w-[85%]` 只限制了宽度但内容仍然从左侧开始。这就是截图里 `海辰.docx` 这种用户消息看起来居中/偏左、没有贴到右边的根本原因。

同时,`MessageBubble` 内部对各种类型(text / file / image / audio)分别写了 `ml-auto`,而 `task` 类型(系统派发任务卡)是对方消息但被写成了固定 `max-w-[85%]`,没显式靠左,这块也顺手统一一下更稳。

## 修改方案(只动一个文件:`src/pages/Workspace.tsx`)

1. **把消息列表外层改为 flex 列布局**(让 `ml-auto` 真正生效)
   - 将 `<div className="mx-auto max-w-4xl space-y-4">` 改为 `<div className="mx-auto flex max-w-4xl flex-col gap-4">`(用 `flex flex-col` + `gap-4` 替代 `space-y-4`,这样 flex 子项的 `ml-auto` 才会把它推到右边)。

2. **统一 `MessageBubble` 各分支的对齐写法**(防御性):
   - text 分支(2613 行):`className={cn("flex max-w-[85%]", isUser ? "ml-auto justify-end" : "mr-auto justify-start")}`
   - file 分支(2569 行):同上
   - image 分支(2532 行):同上
   - audio 分支(2579 行):同上
   - task 分支(2516 行):新增 `className="max-w-[85%] mr-auto"`,确保派发任务卡靠左
   - system 分支保持居中(`text-center`)不变

3. **不动**:气泡内部样式、颜色、`rounded-tr-sm` / `rounded-tl-sm` 这些细节,只调整对齐容器。

## 不会影响的部分

- 邮件 tab、群聊会话列表、HR FAQ、self-eval 等都不在改动范围内
- 不动 Stripe / 支付相关代码
- 不动数据层、消息存储

## 验收标准

- 用户自己发的消息(text/file/image/audio)整条气泡贴到聊天区域**右侧**
- 对方(leader / group / hr)发的消息贴**左侧**
- system 类型仍居中
- 移动端 / 桌面端表现一致
