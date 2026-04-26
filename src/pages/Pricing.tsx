import { Link } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Sparkles, Crown, Zap, Package } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

type Plan = {
  key: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlight?: "free" | "basic" | "premium";
  icon: typeof Sparkles;
  actionType: "link" | "checkout";
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "免费体验",
    price: "¥0",
    period: "永久免费",
    description: "体验真实投行节奏",
    features: [
      "1 个固定项目（兴通投行 IPO）",
      "完整任务流程 + AI 反馈",
      "结业证书 + 能力报告",
      "社区支持",
    ],
    cta: "开始免费体验",
    icon: Sparkles,
    actionType: "link",
    highlight: "free",
  },
  {
    key: "basic",
    name: "基础月度会员",
    price: "¥59",
    period: "/月",
    description: "适合刚入门、想多体验几个项目",
    features: [
      "免费项目 + 自选 3 个 Pro 项目",
      "可自由组合赛道（IBD / M&A / PE / ER）",
      "30 天有效，按下单日次月续费",
      "全部能力报告与证书",
    ],
    cta: "选择基础套餐",
    icon: Zap,
    actionType: "checkout",
    highlight: "basic",
  },
  {
    key: "premium",
    name: "高级月度会员",
    price: "¥198",
    period: "/月",
    description: "面向求职冲刺，全赛道覆盖",
    features: [
      "免费项目 + 自选 10 个 Pro 项目",
      "覆盖全部赛道与公司类型",
      "30 天有效，按下单日次月续费",
      "优先客服 + 项目库新项目优先解锁",
      "支持从基础升级，仅补差价 ¥139",
    ],
    cta: "选择高级套餐",
    popular: true,
    icon: Crown,
    actionType: "checkout",
    highlight: "premium",
  },
];

const SINGLE_PURCHASES = [
  { key: "single_1", count: 1, price: "¥22", desc: "单个项目额度" },
  { key: "single_2", count: 2, price: "¥44", desc: "两个项目额度" },
  { key: "single_3", count: 3, price: "¥66", desc: "三个项目额度" },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  // planKey 来自前端按钮,要映射到 edge function 接受的 product_type
  const PLAN_TO_PRODUCT: Record<string, string> = {
    basic: "subscription_basic",
    premium: "subscription_premium",
    upgrade: "upgrade_diff",
    single_1: "single_1",
    single_2: "single_2",
    single_3: "single_3",
  };

  const handleCheckout = async (planKey: string) => {
    if (!user) {
      toast.info("请先登录", { description: "登录后即可购买套餐" });
      navigate("/login?redirect=/pricing");
      return;
    }
    const productType = PLAN_TO_PRODUCT[planKey];
    if (!productType) {
      toast.error("未知的套餐类型");
      return;
    }
    setLoadingKey(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product_type: productType },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("未收到支付链接");
      window.location.href = data.url as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "创建支付订单失败";
      toast.error("无法跳转到支付", { description: msg, duration: 6000 });
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl space-y-20">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              永久免费体验 · 升级随时
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              选择你的<span className="text-primary">训练计划</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              从免费体验开始，按需升级到月度会员，或单买项目额度。所有套餐都包含完整的任务流程、AI 反馈和结业证书。
            </p>
          </div>

          {/* 三大档位 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <GlassCard
                key={plan.key}
                variant={plan.popular ? "gold" : "default"}
                className="p-7 space-y-6 text-left relative flex flex-col"
              >
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary/30 border">
                    最受欢迎
                  </Badge>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${plan.popular ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <plan.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-display font-semibold text-foreground">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.actionType === "link" ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/register">
                      {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className={
                      plan.popular
                        ? "w-full gradient-gold text-primary-foreground border-0"
                        : "w-full"
                    }
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.key)}
                  >
                    {plan.popular && <Sparkles className="h-4 w-4 mr-1" />}
                    {plan.cta} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </GlassCard>
            ))}
          </div>

          {/* 升级补差价说明 */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2">
            <div className="text-sm font-medium text-foreground">已是基础会员？升级到高级仅需补差价 ¥139</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              升级后总额度自动按 11 个项目计算，已用项目数继承，剩余额度 = 11 - 已使用项目数。
            </p>
          </div>

          {/* 单买额度 */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                按需购买 · 永久解锁
              </div>
              <h2 className="text-2xl font-display font-semibold text-foreground">不想订阅？单买项目额度</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                适合只想完成 1–3 个特定项目的同学。一次购买永久有效，不会过期。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {SINGLE_PURCHASES.map((item) => (
                <GlassCard key={item.key} className="p-6 space-y-4 text-left">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.desc}</div>
                      <div className="mt-1 text-3xl font-display font-bold text-foreground">{item.price}</div>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-display font-semibold text-primary">
                      ×{item.count}
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      永久解锁，不限时间
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      可在项目库自由选择
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => handleCheckout(item.key)}>
                    立即购买 <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* 安全 & 退款说明 */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-secondary/30 p-6 space-y-3">
            <div className="text-sm font-medium text-foreground">支付与安全</div>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li>• 支付通过 Stripe 处理，符合 PCI-DSS 国际安全标准，信用卡信息从不经过我们的服务器</li>
              <li>• 月度会员按下单日的次月同一日自动续费，可在「设置」里随时取消，取消后当前周期结束停止续费</li>
              <li>• 单买的项目额度永久有效，订阅会员的项目解锁额度跟随订阅周期</li>
              <li>• 如需退款，请在购买后 7 天内联系客服</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
