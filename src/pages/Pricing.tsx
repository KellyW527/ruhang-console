import { Link } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "¥0",
    period: "永久免费",
    description: "体验基础模拟线",
    features: ["1 条模拟线", "基础能力报告", "社区支持"],
    cta: "开始免费体验",
    popular: false,
    actionType: "link" as const,
  },
  {
    name: "Pro",
    price: "¥99",
    period: "/月",
    description: "解锁全部模拟线和高级功能",
    features: ["全部 3 条模拟线", "详细能力报告", "自定义偏好", "优先支持", "数据导出"],
    cta: "升级 Pro",
    popular: true,
    actionType: "upgrade" as const,
  },
];

const Pricing = () => {
  const handleUpgrade = () => {
    toast.info("Pro 升级通道即将开放", {
      description: "我们正在接入支付系统，敬请期待！如需提前体验，请联系管理员。",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-16">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              选择你的<span className="text-primary">训练计划</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              从免费体验开始，随时升级解锁更多模拟线和高级功能。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <GlassCard
                key={plan.name}
                variant={plan.popular ? "gold" : "default"}
                className="p-8 space-y-6 text-left relative"
              >
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary/30 border">
                    推荐
                  </Badge>
                )}
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.actionType === "link" ? (
                  <Button
                    asChild
                    className="w-full"
                    variant="outline"
                  >
                    <Link to="/register">
                      {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full gradient-gold text-primary-foreground border-0"
                    onClick={handleUpgrade}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
