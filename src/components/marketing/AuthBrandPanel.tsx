export function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 gradient-navy relative overflow-hidden min-h-screen">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-40 left-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-2xl font-display font-semibold text-foreground">RuHang</span>
        </div>
        <div className="space-y-3 mt-12">
          <h2 className="text-3xl font-display font-semibold text-foreground leading-tight">
            沉浸式金融<br />
            <span className="text-primary">职场训练平台</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            在真实模拟的工作环境中，与 AI 驱动的同事协作，掌握金融行业核心技能。
          </p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs text-primary font-semibold">98%</span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">学员满意度</p>
              <p className="text-xs text-muted-foreground">基于 500+ 学员反馈</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          "最接近真实工作的训练体验" — 某投行分析师
        </p>
      </div>
    </div>
  );
}
