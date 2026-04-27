## 目标
让工作台 (`src/pages/Workspace.tsx`) 在桌面端 (lg 及以上) 的两个 `aside` —— **左侧"项目会话/资料包"**（约第 1473–1603 行）和**右侧"任务推进"**（约第 2065–2288 行）—— 都可以**手动折叠成一条窄竖条 + 图标**，点击图标再展开回完整宽度，让中间的"工作区"主面板更宽更清爽。移动端 (lg 以下) 的 Tab 切换逻辑保持不变。

## 改动范围
仅修改 `src/pages/Workspace.tsx`，不引入新依赖；复用项目已有的 lucide 图标与现有 Tailwind token，不会破坏 navy/gold 设计。

## 具体方案

### 1. 新增本地状态
在文件顶部 `mobilePanel` 旁边新增两个桌面端折叠状态：
```ts
const [leftCollapsed, setLeftCollapsed] = useState(false);
const [rightCollapsed, setRightCollapsed] = useState(false);
```
（默认展开。后续如需持久化可加 `localStorage`，本次先做内存状态。）

### 2. 左侧 aside（项目会话）
- 把 `lg:w-[308px]` 改成根据 `leftCollapsed` 切换：展开 `lg:w-[308px]`，折叠 `lg:w-[56px]`。
- 折叠状态下：
  - 隐藏 `Project Brief` 卡片、会话列表正文、资料包列表（用 `lg:hidden` + 在 aside 顶端用 `leftCollapsed && "lg:[&_[data-collapsible-body]]:hidden"` 等方式控制；或直接条件渲染：`{!leftCollapsed && (<>...完整内容...</>)}` 仅在桌面）。
  - 显示一列竖向小图标：项目（BriefcaseBusiness）、会话（Users，带未读小红点）、资料包（FolderOpen），点击任一图标先展开侧栏并滚动到对应 section。
- 在 aside 顶部右上角加一个 `<button>` 折叠按钮（`ChevronLeft` / `ChevronRight`，只在 `lg:flex` 显示），点击切换 `leftCollapsed`。

### 3. 右侧 aside（任务推进）
对称处理：
- 宽度从 `lg:w-[340px]` 切换到 `lg:w-[56px]`。
- 折叠时只显示进度环（小号 `overall%` 数字 + 一根细 progress bar），加 ListTodo / Phone / Target 几个图标。
- 顶部加 `ChevronRight` / `ChevronLeft` 折叠按钮（贴近主面板那一侧）。

### 4. 中间 main
保持 `flex-1`，无需改动 —— 两侧 aside 收窄后中间会自动变宽。

### 5. 过渡动画
两个 aside 增加 `transition-[width] duration-200 ease-out`，避免"啪"地一下。

### 6. 移动端
所有新增的折叠按钮、图标列都加 `hidden lg:flex` / `lg:inline-flex`，确保 lg 以下只走原有的 `mobilePanel` Tab 逻辑，行为完全不变。

## 验证
- 桌面端：点击左/右折叠按钮，aside 收成窄条，中间聊天区变宽；再点击恢复。
- 折叠状态下点击窄条里的图标，应展开并切到对应内容。
- 缩到移动端 (<768px)：折叠按钮隐藏，仍是原来的"会话/工作区/任务"三 Tab 切换。
- 不影响支付、聊天右对齐、任务面板已有交互。
