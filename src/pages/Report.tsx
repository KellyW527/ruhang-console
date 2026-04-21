import { Link } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, Clock, MessageSquare, CheckCircle, Target, Users } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

// TODO: 接入现有逻辑 — 从 Supabase 获取报告数据

const radarData = [
  { skill: "沟通表达", score: 85, fullMark: 100 },
  { skill: "分析能力", score: 78, fullMark: 100 },
  { skill: "时间管理", score: 72, fullMark: 100 },
  { skill: "团队协作", score: 90, fullMark: 100 },
  { skill: "问题解决", score: 82, fullMark: 100 },
  { skill: "专业素养", score: 88, fullMark: 100 },
];

const kpis = [
  { label: "综合得分", value: "82.5", icon: Target, trend: "+5.2" },
  { label: "任务完成率", value: "95%", icon: CheckCircle, trend: "+10%" },
  { label: "平均响应时间", value: "4.2 min", icon: Clock, trend: "-1.3" },
  { label: "沟通质量", value: "A", icon: MessageSquare, trend: "稳定" },
];

const milestones = [
  { time: "Day 1 上午", event: "接受 Offer，阅读 Starter Kit", status: "done" },
  { time: "Day 1 下午", event: "回复 Leader 关于项目方向的问题", status: "done" },
  { time: "Day 2 上午", event: "完成行业对标数据分析", status: "done" },
  { time: "Day 2 下午", event: "提交研究报告邮件", status: "done" },
  { time: "Day 3", event: "与 HR 确认入职流程", status: "done" },
];

const Report = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="font-display font-semibold text-foreground">能力报告</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-border/50">
            <Download className="h-3 w-3" /> 导出
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-10 max-w-6xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            投行分析师<span className="text-primary">能力评估</span>
          </h1>
          <p className="text-muted-foreground">基于你的模拟表现生成的深度能力分析报告。</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <GlassCard key={kpi.label} variant="gold" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <kpi.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {kpi.trend}
                </span>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <GlassCard variant="gold" className="p-6">
            <h3 className="font-display font-semibold text-foreground mb-6">六维能力评估</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 30%, 18%)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="得分"
                  dataKey="score"
                  stroke="hsl(41, 66%, 55%)"
                  fill="hsl(41, 66%, 55%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Milestones */}
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-foreground mb-6">模拟时间线</h3>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    {i < milestones.length - 1 && <div className="w-px h-full bg-border/50 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-primary font-medium">{m.time}</p>
                    <p className="text-sm text-foreground mt-1">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Recommendations */}
        <GlassCard variant="gold" className="p-8">
          <h3 className="font-display font-semibold text-foreground text-lg mb-4">能力提升建议</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { area: "时间管理", suggestion: "建议在收到任务后先进行优先级排序，预估完成时间后再开始执行。" },
              { area: "分析深度", suggestion: "在提交数据分析时，增加对关键假设的敏感性分析，展示不同情景下的结果。" },
              { area: "主动沟通", suggestion: "在项目推进中，主动向 Leader 同步进展和潜在风险，不要等被问到才回复。" },
            ].map((r) => (
              <div key={r.area} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium text-foreground">{r.area}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.suggestion}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-center">
          <Button asChild variant="outline" className="border-border/50">
            <Link to="/dashboard">返回控制台</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Report;
