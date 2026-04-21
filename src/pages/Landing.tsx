import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { StatBar } from "@/components/marketing/StatBar";
import { TrackCard } from "@/components/marketing/TrackCard";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Users, CheckCircle, MessageSquare, BarChart3, ArrowRight } from "lucide-react";

const tracks = [
  {
    title: "投行分析师模拟",
    description: "模拟真实投行分析师的日常工作：财务建模、客户沟通、团队协作，在压力下做出正确决策。",
    difficulty: "高级" as const,
    icon: TrendingUp,
    features: ["财务建模与分析", "客户沟通演练", "团队协作场景", "Pitch Book 制作"],
  },
  {
    title: "咨询顾问模拟",
    description: "体验管理咨询顾问的工作节奏：结构化思维、方案设计、客户汇报，快速适应多变需求。",
    difficulty: "中级" as const,
    icon: Briefcase,
    features: ["案例分析训练", "结构化问题解决", "客户关系管理", "方案演示技巧"],
  },
  {
    title: "行业研究员模拟",
    description: "深入行业研究的完整流程：数据收集、趋势分析、报告撰写，培养敏锐的市场洞察力。",
    difficulty: "初级" as const,
    icon: BarChart3,
    features: ["行业数据分析", "研究报告撰写", "趋势判断训练", "信息整合能力"],
  },
];

const steps = [
  { num: "01", title: "注册账户", desc: "创建你的 RuHang 账户，选择你感兴趣的模拟线。" },
  { num: "02", title: "开始模拟", desc: "进入沉浸式工作台，与 AI 同事互动，完成真实任务。" },
  { num: "03", title: "获取报告", desc: "完成模拟后获取详细能力报告，了解你的优势与提升方向。" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/3 blur-[80px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-gold" />
              金融职场沉浸式训练
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight">
              在真实场景中<br />
              <span className="text-primary">锻炼核心能力</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RuHang 通过 AI 驱动的沉浸式模拟，让你在投行、咨询、研究等场景中体验真实工作，
              快速提升职场竞争力。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="gradient-gold text-primary-foreground border-0 hover:opacity-90 text-base px-8 h-12">
                <Link to="/register">
                  免费开始模拟
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-border/50 text-foreground hover:bg-secondary text-base px-8 h-12">
                <Link to="/login">已有账户？登录</Link>
              </Button>
            </div>
          </motion.div>

          {/* Workspace Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20"
          >
            <div className="glass-card-gold p-2 rounded-2xl">
              <div className="rounded-xl bg-secondary/30 p-6 min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                  <div className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">会话列表</span>
                    </div>
                    <div className="space-y-2">
                      {["Leader · 张总", "项目组 · 研究部", "HR · 王女士"].map((n) => (
                        <div key={n} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="h-6 w-6 rounded-full bg-primary/20" />
                          <span className="text-xs text-muted-foreground">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">聊天区域</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-muted/50 rounded-lg p-2"><span className="text-xs text-muted-foreground">请查阅最新财务数据...</span></div>
                      <div className="bg-primary/10 rounded-lg p-2 ml-4"><span className="text-xs text-primary">收到，正在处理...</span></div>
                    </div>
                  </div>
                  <div className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">任务面板</span>
                    </div>
                    <div className="space-y-2">
                      {["阅读 Starter Kit", "回复 Leader", "提交邮件"].map((t) => (
                        <div key={t} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="h-3 w-3 rounded-full border border-primary/40" />
                          <span className="text-xs text-muted-foreground">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6">
        <div className="container mx-auto max-w-4xl">
          <StatBar />
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              三条<span className="text-primary">模拟线</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              覆盖金融行业核心岗位，每条线都包含完整的工作场景和能力评估。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tracks.map((track, i) => (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <TrackCard {...track} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              如何<span className="text-primary">运作</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              三步开始你的沉浸式训练之旅
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard className="text-center space-y-4 h-full">
                  <span className="text-4xl font-display font-bold text-primary/30">{step.num}</span>
                  <h3 className="text-lg font-display font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Real Training */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                为什么选择<br /><span className="text-primary">真实场景训练</span>？
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                传统的案例学习和理论课程无法让你真正体验工作中的压力与决策。
                RuHang 通过 AI 驱动的动态场景，让你在接近真实的环境中犯错、学习、成长。
              </p>
              <div className="space-y-4">
                {[
                  "AI 驱动的动态对话，每次模拟都不同",
                  "真实工作流程还原，不是简单的选择题",
                  "即时反馈与深度解析，加速能力内化",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard variant="gold" className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-display font-bold">A+</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">能力评估报告</p>
                    <p className="text-xs text-muted-foreground">6 维度深度分析</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["沟通表达", "问题解决", "时间管理", "团队协作"].map((skill) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{skill}</span>
                        <span className="text-primary">{Math.floor(70 + Math.random() * 25)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-gold rounded-full" style={{ width: `${70 + Math.random() * 25}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <GlassCard variant="gold" className="py-16 px-8 space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              准备好开始你的<span className="text-primary">训练</span>了吗？
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              加入 500+ 学员，在沉浸式模拟中提升你的金融职场竞争力。
            </p>
            <Button asChild size="lg" className="gradient-gold text-primary-foreground border-0 hover:opacity-90 text-base px-10 h-12">
              <Link to="/register">
                免费开始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
