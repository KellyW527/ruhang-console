import { Link } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, ArrowRight, Sparkles, Crown, Zap, Package, X, HelpCircle } from "lucide-react";
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

type Cell = boolean | string;
const COMPARISON: { feature: string; free: Cell; basic: Cell; premium: Cell }[] = [
  { feature: "可解锁项目数", free: "1（兴通投行 IPO）", basic: "1 + 自选 3 个 Pro", premium: "1 + 自选 10 个 Pro" },
  { feature: "覆盖赛道", free: "投行 IBD", basic: "可跨 4 大赛道", premium: "全部 4 大赛道" },
  { feature: "完整任务流程 + AI 反馈", free: true, basic: true, premium: true },
  { feature: "结业证书 + 能力报告", free: true, basic: true, premium: true },
  { feature: "项目库新项目优先解锁", free: false, basic: false, premium: true },
  { feature: "优先客服支持", free: false, basic: false, premium: true },
  { feature: "支持升级补差价", free: false, basic: "升级到高级 ¥139", premium: "—" },
  { feature: "有效期", free: "永久", basic: "30 天周期", premium: "30 天周期" },
];

const FAQS = [
  {
    q: "免费体验和付费会员的核心区别是什么？",
    a: "免费体验固定只能做「兴通投行 IPO」一个项目，但流程、AI 反馈、证书、能力报告完全相同。付费会员的差异在于：可以解锁更多 Pro 项目、跨赛道学习、获得新项目优先体验权。",
  },
  {
    q: "月度会员到期后会自动续费吗？可以取消吗？",
    a: "会自动续费。订阅会按下单日的次月同一日扣款，你可以在「设置 → 订阅管理」里随时取消，取消后当前周期内仍可正常使用，到期后停止续费，不再扣款。",
  },
  {
    q: "基础会员能升级到高级会员吗？",
    a: "可以。升级只需补差价 ¥139（198 - 59）。升级后总额度按 11 个项目计算（1 免费 + 10 Pro），已使用项目数自动继承，剩余额度 = 11 - 已用项目数。",
  },
  {
    q: "单买项目和会员的区别？哪个更划算？",
    a: "单买项目是永久解锁，不会过期，适合只想完成 1–3 个特定项目的同学。会员是 30 天周期套餐，适合想多体验、跨赛道学习的同学。如果你只想做 1–2 个项目，单买更省钱；3 个以上建议直接订阅基础会员。",
  },
  {
    q: "退款政策是什么？",
    a: "购买后 7 天内、且尚未开始任何 Pro 项目的，可联系客服全额退款。已开始的项目按已消耗的项目额度比例扣减后退款。免费体验项目不影响退款。",
  },
  {
    q: "支付安全吗？发票怎么开？",
    a: "支付全程通过 Stripe 处理，符合 PCI-DSS 国际安全标准，我们的服务器从不接触你的信用卡信息。如需开具电子发票，请在购买后联系客服，提供订单号与抬头信息即可。",
  },
  {
    q: "完成项目后我会得到什么？",
    a: "每完成一个项目你会得到：① 一份带 5 维评分的能力报告；② 一张可下载的结业证书；③ 全部交付物（PPT / Excel / Memo）作为作品集留存；④ 对应的能力勋章解锁到你的档案。",
  },
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
      toast.info("请先登录或注册后再选择套餐", { duration: 4000 });
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
                    disabled={loadingKey === plan.key}
                  >
                    {plan.popular && <Sparkles className="h-4 w-4 mr-1" />}
                    {loadingKey === plan.key ? "正在跳转..." : <>{plan.cta} <ArrowRight className="h-4 w-4 ml-1" /></>}
                  </Button>
                )}
              </GlassCard>
            ))}
          </div>

          {/* 套餐对比表 */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-semibold text-foreground">详细功能对比</h2>
              <p className="text-sm text-muted-foreground">把三档套餐放在一起，看清楚再决定。</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-secondary/20">
              {/* 桌面端表格 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-background/40">
                      <th className="px-5 py-4 text-left font-medium text-muted-foreground w-[34%]">功能</th>
                      <th className="px-5 py-4 text-center font-display font-semibold text-foreground">免费体验</th>
                      <th className="px-5 py-4 text-center font-display font-semibold text-foreground">基础月度</th>
                      <th className="px-5 py-4 text-center font-display font-semibold text-primary">
                        高级月度
                        <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 border text-[10px]">推荐</Badge>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? "bg-background/20" : ""}>
                        <td className="px-5 py-3.5 text-foreground/90">{row.feature}</td>
                        {(["free", "basic", "premium"] as const).map((col) => {
                          const v = row[col];
                          return (
                            <td key={col} className="px-5 py-3.5 text-center">
                              {typeof v === "boolean" ? (
                                v ? (
                                  <CheckCircle className="inline h-4 w-4 text-primary" />
                                ) : (
                                  <X className="inline h-4 w-4 text-muted-foreground/40" />
                                )
                              ) : (
                                <span className="text-xs text-foreground/80">{v}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 移动端：分块卡片 */}
              <div className="md:hidden divide-y divide-border/40">
                {COMPARISON.map((row) => (
                  <div key={row.feature} className="p-4 space-y-2">
                    <div className="text-sm font-medium text-foreground">{row.feature}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(["free", "basic", "premium"] as const).map((col) => {
                        const v = row[col];
                        const labels = { free: "免费", basic: "基础", premium: "高级" };
                        return (
                          <div key={col} className="rounded-lg border border-border/40 bg-background/30 px-2 py-2 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{labels[col]}</div>
                            {typeof v === "boolean" ? (
                              v ? (
                                <CheckCircle className="inline h-3.5 w-3.5 text-primary" />
                              ) : (
                                <X className="inline h-3.5 w-3.5 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-foreground/80 text-[11px] leading-tight">{v}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCheckout(item.key)}
                    disabled={loadingKey === item.key}
                  >
                    {loadingKey === item.key ? "正在跳转..." : <>立即购买 <ArrowRight className="h-4 w-4 ml-1" /></>}
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

          {/* FAQ */}
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground">
                <HelpCircle className="h-3 w-3" />
                常见问题
              </div>
              <h2 className="text-2xl font-display font-semibold text-foreground">还有疑问？</h2>
              <p className="text-sm text-muted-foreground">最常被问到的 7 个问题，先看这里。</p>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border border-border/60 bg-secondary/20 px-5">
              {FAQS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className={i === FAQS.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
