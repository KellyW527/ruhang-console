

## 删除"成长勋章"面板并重新调整控制台排版

### 删除内容
从 `src/pages/Dashboard.tsx` 第二行区块（赛道矩阵右侧）中移除"成长勋章"面板（约 lines 688–724 的 `<section className="glass-deep ...">` 整段）。

保留：
- 导航栏里的"我的勋章"入口（点击弹出 MedalShelf 弹窗）
- MedalCelebration 解锁动画
- 勋章数据查询逻辑
- KPI 栏里的"已点亮勋章"指标

### 排版调整
删除勋章面板后，右侧列只剩"快捷入口"一个区块，视觉上会偏空。调整方案：

1. **第二行**（赛道矩阵 + 右侧）：将比例从 `xl:grid-cols-[1.18fr_0.82fr]` 改为 `xl:grid-cols-[1.4fr_0.6fr]`，让赛道矩阵占更多空间，快捷入口收窄但不会太空
2. **快捷入口区块**：去掉外层 `<div className="grid gap-6">` 包装（原来包两个 section，现在只剩一个），直接放 `<section>` 即可

### 涉及文件
- `src/pages/Dashboard.tsx`

