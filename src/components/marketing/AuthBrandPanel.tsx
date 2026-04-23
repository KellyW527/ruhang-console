import logoImg from "@/assets/logo.png";

export function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 gradient-navy relative overflow-hidden min-h-screen">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-40 left-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="入行" className="h-10 w-10 rounded-lg object-contain" />
          <span className="text-2xl font-display font-semibold text-foreground">入行 RuHang</span>
        </div>
        <div className="space-y-3 mt-12">
          <h2 className="text-3xl font-display font-semibold text-foreground leading-tight">
            沉浸式金融<br />
            <span className="text-primary">职场训练平台</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            在真实模拟的工作环境中，与 AI 驱动的上级协作，掌握金融行业核心技能。
          </p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="space-y-4">
          {[
            { icon: "💬", title: "AI 上级派活", desc: "通过即时消息和邮件接收任务" },
            { icon: "📊", title: "标准答案 + 5 维评分", desc: "每次任务都有专业反馈" },
            { icon: "📈", title: "可沉淀的能力档案", desc: "能力雷达可被 HR 看到" },
          ].map((f) => (
            <div key={f.title} className="glass-card p-3 flex items-start gap-3">
              <span className="text-lg">{f.icon}</span>
              <div>
                <p className="text-xs font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          "最接近真实工作的训练体验" — 复旦大学金融硕士
        </p>
      </div>
    </div>
  );
}

export function AuthMobileBrand() {
  return (
    <div className="lg:hidden flex items-center gap-2 mb-8">
      <img src={logoImg} alt="入行" className="h-8 w-8 rounded-lg object-contain" />
      <span className="text-lg font-display font-semibold text-foreground">入行 RuHang</span>
    </div>
  );
}
