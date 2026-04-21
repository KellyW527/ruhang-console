import { Link, useParams } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Calendar, DollarSign, Users, ArrowRight } from "lucide-react";

const OfferLetter = () => {
  const { id } = useParams();

  // TODO: 接入现有逻辑 — 从 Supabase 获取 offer 数据

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <GlassCard variant="gold" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="gradient-gold p-8 text-center space-y-3">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary-foreground">R</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-primary-foreground">Offer Letter</h1>
            <p className="text-sm text-primary-foreground/80">RuHang Financial Simulation</p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">我们很高兴地通知你</p>
              <h2 className="text-xl font-display font-semibold text-foreground">你已被录用为</h2>
              <p className="text-2xl font-display font-bold text-primary">投行分析师（模拟）</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Briefcase, label: "部门", value: "投资银行部" },
                { icon: MapPin, label: "地点", value: "上海·陆家嘴" },
                { icon: Calendar, label: "开始日期", value: "立即开始" },
                { icon: DollarSign, label: "薪资", value: "模拟薪资" },
                { icon: Users, label: "团队", value: "研究部 · 5人团队" },
                { icon: CheckCircle, label: "类型", value: "全程沉浸模拟" },
              ].map((item) => (
                <GlassCard key={item.label} className="p-4 flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="glass-card p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                在接下来的模拟中，你将作为投行分析师参与完整的项目周期。你的 Leader 张总和研究部团队将与你协作。
                请在接受 Offer 后进入工作台，开始你的第一天。
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-12 text-base">
                <Link to={`/simulation/${id}`}>
                  接受 Offer，开始模拟
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-muted-foreground">
                <Link to="/dashboard">返回控制台</Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default OfferLetter;
