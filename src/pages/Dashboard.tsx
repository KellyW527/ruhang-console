import { Link } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { BadgeCard } from "@/components/marketing/BadgeCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Briefcase, BarChart3, Settings, FileText, Award,
  ArrowRight, Play, CheckCircle, Lock, Crown, LogOut
} from "lucide-react";

// TODO: 接入现有逻辑 — 从 Supabase 获取用户数据
const mockUser = {
  preferred_name: "Kelly",
  plan: "pro" as const,
};

const simulations = [
  {
    id: "ib-analyst",
    title: "投行分析师",
    icon: TrendingUp,
    status: "in_progress" as const,
    progress: 45,
    currentTask: "回复 Leader 关于财务模型的问题",
  },
  {
    id: "consulting",
    title: "咨询顾问",
    icon: Briefcase,
    status: "completed" as const,
    progress: 100,
    currentTask: null,
  },
  {
    id: "research",
    title: "行业研究员",
    icon: BarChart3,
    status: "locked" as const,
    progress: 0,
    currentTask: null,
  },
];

const badges = [
  { name: "快速启动", description: "完成首次模拟", earned: true },
  { name: "沟通达人", description: "获得沟通 A+", earned: true },
  { name: "全线通关", description: "完成全部模拟线", earned: false },
  { name: "分析专家", description: "财务分析满分", earned: false },
];

const statusConfig = {
  in_progress: { label: "进行中", color: "bg-primary/20 text-primary border-primary/30", icon: Play },
  completed: { label: "已完成", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  locked: { label: "未解锁", color: "bg-muted text-muted-foreground border-border", icon: Lock },
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            <span className="font-display font-semibold text-foreground">RuHang</span>
          </div>
          <div className="flex items-center gap-4">
            {mockUser.plan === "pro" && (
              <Badge className="bg-primary/20 text-primary border-primary/30 border gap-1">
                <Crown className="h-3 w-3" /> Pro
              </Badge>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/settings"><Settings className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-10 max-w-6xl">
        {/* Welcome */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            你好，<span className="text-primary">{mockUser.preferred_name}</span> 👋
          </h1>
          <p className="text-muted-foreground">继续你的训练，或查看你的能力报告。</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "继续训练", icon: Play, to: "/simulation/ib-analyst", primary: true },
            { label: "能力报告", icon: FileText, to: "/report" },
            { label: "我的勋章", icon: Award, to: "#badges" },
            { label: "设置", icon: Settings, to: "/settings" },
          ].map((action) => (
            <Link key={action.label} to={action.to}>
              <GlassCard variant={action.primary ? "gold" : "default"}
                className="p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform cursor-pointer">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  action.primary ? "bg-primary/20" : "bg-muted"
                }`}>
                  <action.icon className={`h-5 w-5 ${action.primary ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Simulation Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">模拟线</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simulations.map((sim) => {
              const config = statusConfig[sim.status];
              const StatusIcon = config.icon;
              return (
                <GlassCard key={sim.id} variant={sim.status === "in_progress" ? "gold" : "default"}
                  className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <sim.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className={`${config.color} border text-xs gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg">{sim.title}</h3>
                    {sim.currentTask && (
                      <p className="text-xs text-muted-foreground mt-1">{sim.currentTask}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">进度</span>
                      <span className="text-primary">{sim.progress}%</span>
                    </div>
                    <Progress value={sim.progress} className="h-1.5 bg-muted" />
                  </div>

                  {sim.status === "in_progress" && (
                    <Button asChild className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90" size="sm">
                      <Link to={`/simulation/${sim.id}`}>
                        继续 <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                  {sim.status === "completed" && (
                    <Button asChild variant="outline" className="w-full border-border/50" size="sm">
                      <Link to="/report">查看报告</Link>
                    </Button>
                  )}
                  {sim.status === "locked" && (
                    <Button disabled variant="outline" className="w-full border-border/30 opacity-50" size="sm">
                      {mockUser.plan === "pro" ? "即将开放" : "升级解锁"}
                    </Button>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div id="badges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-foreground">我的勋章</h2>
            <span className="text-xs text-muted-foreground">{badges.filter(b => b.earned).length}/{badges.length} 已获得</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {badges.map((b) => (
              <BadgeCard key={b.name} {...b} />
            ))}
          </div>
        </div>

        {/* Capability Nudge */}
        <GlassCard variant="gold" className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-medium text-foreground">你的能力正在沉淀</p>
            <p className="text-sm text-muted-foreground">查看完整的能力评估报告，了解你的提升方向。</p>
          </div>
          <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 whitespace-nowrap">
            <Link to="/report">查看报告 <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
        </GlassCard>
      </main>
    </div>
  );
};

export default Dashboard;
