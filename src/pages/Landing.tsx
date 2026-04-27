import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  BarChart3,
  Handshake,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Award,
  Mail,
  MessagesSquare,
  FileText,
  Phone,
  Quote,
  FileSpreadsheet,
  Presentation,
  FileSignature,
  ScrollText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { TrackCard } from "@/components/marketing/TrackCard";
import { useAuth } from "@/lib/auth";

const Landing = () => {
  const { session } = useAuth();
  const ctaTo = session ? "/dashboard" : "/register";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ========================= Hero ========================= */}
      <section className="relative overflow-hidden bg-gradient-hero pb-28 pt-32">
        <div className="absolute inset-x-0 top-0 h-px hairline-gold opacity-60" />
        <div className="container relative mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              重塑金融人才培养方式
            </div>
            <h1 className="mt-7 font-display text-5xl font-bold leading-[1.15] md:text-6xl">
              在<span className="text-gradient-gold">真实场景</span>里，
              <br />
              成为下一个<span className="text-gradient-gold">华尔街分析师</span>
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-muted-foreground md:text-xl">
              带你在金融行业的真实工作流中<span className="text-gradient-gold">"入行"</span>。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-gradient-gold px-8 text-primary-foreground shadow-glow-gold hover:opacity-95"
              >
                <Link to={ctaTo}>
                  免费开始模拟
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-foreground hover:bg-white/5 px-6 h-12"
              >
                <Link to="/demo">查看产品 Demo</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground sm:gap-8">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" /> 30+ 高校校园大使
              </div>
              <div className="hidden h-3 w-px bg-border sm:block" />
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> 已服务 8,000+ 学员
              </div>
            </div>
          </motion.div>

          {/* Hero footer stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-card md:grid-cols-4"
          >
            {[
              { v: "4", l: "核心赛道" },
              { v: "22+", l: "真实任务" },
              { v: "8", l: "可解锁勋章" },
              { v: "24h", l: "AI 上级在线" },
            ].map((s) => (
              <div key={s.l} className="bg-surface-1/80 px-6 py-7 text-center backdrop-blur">
                <div className="font-display text-3xl font-semibold text-gradient-gold">{s.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= Real task strip (just under hero) ========================= */}
      <section className="relative -mt-10 pb-6">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-5xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">真实任务样例 · 取自现役项目</div>
              <Link to="/pricing" className="hidden text-xs text-primary hover:underline sm:inline-flex items-center gap-1">
                查看全部赛道 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { tag: "投行 IBD", title: "撰写 SaaS 行业研究框架", deliv: "PPT", time: "24h" },
                { tag: "并购 M&A", title: "京北数码五年利润表预测", deliv: "Excel", time: "36h" },
                { tag: "PE/VC", title: "云岚科技投委会 Memo", deliv: "Word", time: "48h" },
                { tag: "卖方研究", title: "锂电链条公司深度报告", deliv: "PDF", time: "30h" },
              ].map((t) => (
                <div
                  key={t.title}
                  className="glass group relative overflow-hidden rounded-xl p-4 transition hover:border-primary/30"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary">
                      {t.tag}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {t.time}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-medium leading-snug text-foreground">{t.title}</div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    交付物 · {t.deliv}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= Why real ========================= */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="eyebrow">不是课程，是真实工作</div>
            <h2 className="mt-3 font-display text-4xl font-bold">
              告别看视频、刷网课的<span className="text-gradient-gold">假装学习</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              入行复刻头部投行、PE、券商研究所的真实工作流。
              你会有上级、同事、HR、deadline、反馈、勋章——以及每一份你真的写出来的交付物。
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              {
                icon: MessagesSquare,
                title: "AI 上级会派活、会催进度",
                body: "通过即时消息和邮件接收任务，按真实节奏沟通、汇报、被反馈。",
              },
              {
                icon: FileText,
                title: "真实文件、真实交付物",
                body: "下载 starter kit，写出真正可以放进简历的报告、模型与 memo。",
              },
              {
                icon: Award,
                title: "可沉淀的能力档案",
                body: "每次任务都生成 5 维评分与雷达，能力可视化，可被 HR 看到。",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass group rounded-2xl p-6 transition hover:border-primary/30"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-gradient-gold group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= Tracks ========================= */}
      <section id="tracks" className="relative py-20 scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="mb-14 text-center">
            <div className="eyebrow">四大核心赛道</div>
            <h2 className="mt-3 font-display text-4xl font-bold">选一条赛道，开始你的第一段实习</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              每条赛道都有专属的公司、Leader、starter kit 与完整任务流。
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <TrackCard
              icon={Briefcase}
              tag="投资银行 IB"
              title="华锐证券 · IPO 项目组"
              desc="跟随 VP 完成科创板申报全流程，从行业研究到招股书撰写，亲历 sell-side 的高强度节奏。"
              tasks={["行业研究框架", "财务尽调", "估值建模", "招股书撰写", "问询函回复", "路演材料"]}
            />
            <TrackCard
              icon={TrendingUp}
              tag="私募股权 PE/VC"
              title="曜石资本 · 投资项目组"
              desc="从赛道 Mapping 到投委会答辩，体验消费科技投资一笔成长项目的完整决策链路。"
              tasks={["赛道 Mapping", "商业模式拆解", "尽调执行", "估值与条款", "投委会 Memo", "投后管理"]}
              pro
            />
            <TrackCard
              icon={BarChart3}
              tag="卖方研究 ER"
              title="明信证券 · 新能源组"
              desc="加入新能源组覆盖锂电链条，从行业框架到深度报告、点评写作，体验研究员的一周。"
              tasks={["行业框架", "公司深度", "电话会议纪要", "盈利模型", "深度报告", "业绩点评"]}
            />
            <TrackCard
              icon={Handshake}
              tag="并购 M&A"
              title="华兴并购 · 京北数码买方组"
              desc="跟随 VP 为客户鸿华百货完成对京北数码的买方收购：Target Profile、五年预测、Comps 与战略备忘一笔走通。"
              tasks={["Target Profile", "五年利润表预测", "Trading Comps", "收购后战略备忘"]}
              pro
            />
          </div>
        </div>
      </section>

      {/* ========================= How it works ========================= */}
      <section id="how" className="relative py-28">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <div className="eyebrow">运作方式</div>
            <h2 className="mt-3 font-display text-4xl font-bold">沉浸式体验，四步入行</h2>
            <p className="mt-3 text-muted-foreground">不是看视频，不是做题——是真的"上班"。</p>
          </div>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute left-6 top-2 bottom-2 hidden w-px border-l-2 border-dashed border-primary/40 md:left-1/2 md:block" />
            {[
              { step: "01", title: "签下你的 Offer", body: "选择心仪的赛道，从一封正式的 Offer Letter 开启职业旅程。" },
              { step: "02", title: "接收上级派活", body: "AI 上级会通过即时消息和邮件给你布置真实的工作任务，附带交付期限。" },
              { step: "03", title: "提交并获得反馈", body: "完成作业后提交，立刻获得带评分维度的专业反馈与对照标准答案。" },
              { step: "04", title: "积累能力档案", body: "每一次模拟都生成你的能力雷达，沉淀真正可写进简历的金融实战经验。" },
            ].map((it, i) => (
              <motion.div
                key={it.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative mb-10 flex items-start gap-6 md:mb-16 md:items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
                }`}
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-mono text-sm font-bold text-primary-foreground shadow-glow-gold md:mx-auto md:absolute md:left-1/2 md:-translate-x-1/2">
                  {it.step}
                </div>
                <div className={`glass rounded-2xl p-6 md:w-[calc(50%-3rem)] ${i % 2 === 1 ? "md:mr-auto" : "md:ml-auto"}`}>
                  <h3 className="font-display text-xl font-semibold">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= Product workspace preview ========================= */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <div className="eyebrow">真实终端</div>
            <h2 className="mt-3 font-display text-4xl font-bold">像在真实公司里工作</h2>
            <p className="mt-3 text-muted-foreground">即时消息 / 邮件 / 任务面板 一体化工作台。</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-5xl"
          >
            <div className="absolute -inset-12 halo-gold opacity-50 blur-3xl" />
            <div className="glass-strong relative grid grid-cols-12 overflow-hidden rounded-3xl border border-primary/15 shadow-deep">
              {/* Conversations column */}
              <div className="col-span-3 border-r border-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">会话</div>
                  <div className="dot-unread" />
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-lg border-l-2 border-primary bg-primary/10 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-foreground">周恺 · VP</div>
                      <span className="dot-unread" />
                    </div>
                    <div className="mt-1 text-muted-foreground line-clamp-1">明早立项会要用，9 点前发我</div>
                  </div>
                  <div className="rounded-lg p-3 text-xs row-read">
                    <div className="text-foreground">华锐 IPO 项目组</div>
                    <div className="mt-1 text-muted-foreground line-clamp-1">@all 模板已上传共享盘</div>
                  </div>
                  <div className="rounded-lg p-3 text-xs row-read">
                    <div className="text-foreground">人力资源部</div>
                    <div className="mt-1 text-muted-foreground line-clamp-1">入职手续已完成</div>
                  </div>
                </div>
              </div>

              {/* Chat column */}
              <div className="col-span-6 flex flex-col p-4">
                <div className="mb-4 flex items-center gap-2 border-b border-white/5 pb-3 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">周</div>
                  <div className="flex-1">
                    <div className="font-medium">周恺 · VP</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 在线
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/5 p-3 text-xs leading-relaxed">
                    小李，刚拿到一个项目意向：杭州一家做 HR SaaS 的公司，叫"云岚科技"。今晚 9 点前给我一份行业研究框架。
                  </div>
                  <div className="card-material text-xs">
                    <div className="mb-1 eyebrow">📌 任务</div>
                    <div className="font-medium">行业研究：企业级 SaaS 赛道</div>
                    <div className="mt-1 text-muted-foreground">截止 24 小时内</div>
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-gold p-3 text-xs text-primary-foreground">
                    收到周恺，今晚之前给您。
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="typing-dot inline-block h-1 w-1 rounded-full bg-primary" />
                    <span className="typing-dot inline-block h-1 w-1 rounded-full bg-primary" />
                    <span className="typing-dot inline-block h-1 w-1 rounded-full bg-primary" />
                    <span className="ml-1">周恺正在输入…</span>
                  </div>
                </div>
              </div>

              {/* Tasks column */}
              <div className="col-span-3 border-l border-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">任务进度</div>
                  <div className="font-mono text-[10px] text-primary">33%</div>
                </div>
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-1/3 rounded-full bg-gradient-gold" />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 行业研究
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="dot-unread" /> 财务尽调
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">🔒 估值建模</div>
                  <div className="flex items-center gap-2 text-muted-foreground">🔒 招股书</div>
                </div>
                <div className="mt-5 hairline-gold" />
                <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">已得勋章</div>
                <div className="mt-2 flex gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-gold text-xs">🥇</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs">🎯</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs opacity-40">🔒</div>
                </div>
              </div>
            </div>

            {/* Floating channel chips */}
            <div className="absolute -left-4 top-12 hidden md:block">
              <div className="glass flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1.5 text-xs shadow-elegant">
                <Mail className="h-3.5 w-3.5 text-primary" /> 邮件已送达
              </div>
            </div>
            <div className="absolute -right-4 bottom-12 hidden md:block">
              <div className="glass flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1.5 text-xs shadow-elegant">
                <Phone className="h-3.5 w-3.5 text-primary" /> 1 个语音任务
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= Curriculum sample ========================= */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <div className="eyebrow">课程样片</div>
            <h2 className="mt-3 font-display text-4xl font-bold">一段华锐证券的真实一周</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              下面是 IB IPO 模拟里前三个任务的真实节奏，每个任务都有 starter kit、deadline、评分标准与 leader 反馈。
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-3">
            {[
              { day: "Day 1", title: "行业研究框架：企业级 SaaS 赛道", time: "24 小时", deliv: "PPT · 行业 mapping" },
              { day: "Day 2", title: "财务尽调清单与红旗梳理", time: "18 小时", deliv: "Excel · 尽调 checklist" },
              { day: "Day 3", title: "DCF / 可比公司估值模型", time: "36 小时", deliv: "Excel · 估值模型" },
            ].map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass flex items-center gap-5 rounded-2xl p-5 transition hover:border-primary/30"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 font-mono">
                  <div className="text-[10px] text-muted-foreground">{t.day.split(" ")[0]}</div>
                  <div className="text-base font-bold text-primary">{t.day.split(" ")[1]}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-medium">{t.title}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>⏰ {t.time}</span>
                    <span className="text-border">·</span>
                    <span>📎 {t.deliv}</span>
                  </div>
                </div>
                <div className="hidden text-xs text-muted-foreground md:block">5 维评分</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= What you will produce ========================= */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="eyebrow">作品集级别交付物</div>
            <h2 className="mt-3 font-display text-4xl font-bold">
              你会真正<span className="text-gradient-gold">产出</span>这些东西
            </h2>
            <p className="mt-4 text-muted-foreground">
              不是练习册、不是打卡，是一份份能直接放进实习简历、被 HR 拿来当谈资的真实交付物。
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Presentation,
                tag: "PPT · 投行",
                title: "行业研究框架",
                desc: "20+ 页的行业 mapping、竞争格局、关键指标，附 Leader 批注。",
                meta: ["20+ 页", "中英对照", "招股书可复用"],
              },
              {
                icon: FileSpreadsheet,
                tag: "Excel · 并购",
                title: "五年利润表预测模型",
                desc: "完整的收入/成本/费用/税/净利模型，含敏感性分析与 Comps 表。",
                meta: ["6 个 sheet", "公式驱动", "可拷贝"],
              },
              {
                icon: FileSignature,
                tag: "Word · PE",
                title: "投委会 Memo",
                desc: "Deal Thesis、市场、商业模式、估值、风险一份打通的投委会备忘录。",
                meta: ["8–12 页", "标准结构", "PE 风格"],
              },
              {
                icon: ScrollText,
                tag: "PDF · 卖方研究",
                title: "公司深度报告",
                desc: "覆盖行业、公司、盈利模型、估值与目标价，按券商研究所标准模板撰写。",
                meta: ["30+ 页", "含盈利模型", "目标价拆解"],
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass group relative flex flex-col overflow-hidden rounded-2xl p-6 transition hover:border-primary/30"
              >
                {/* 模拟"文档预览"上半区 */}
                <div className="relative mb-5 h-28 overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-1/60 to-transparent">
                  <div className="absolute inset-0 p-3">
                    <div className="mb-2 h-1 w-1/3 rounded bg-primary/40" />
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded bg-white/10" />
                      <div className="h-1 w-[90%] rounded bg-white/10" />
                      <div className="h-1 w-[75%] rounded bg-white/10" />
                      <div className="h-1 w-[85%] rounded bg-white/10" />
                      <div className="h-1 w-[60%] rounded bg-white/10" />
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <div className="h-6 w-10 rounded bg-primary/20" />
                      <div className="h-6 w-10 rounded bg-white/5" />
                      <div className="h-6 w-10 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground shadow-glow-gold">
                    <p.icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="text-[10px] uppercase tracking-[0.18em] text-primary">{p.tag}</div>
                <h3 className="mt-2 font-display text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.meta.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            所有交付物完成后自动归档到你的「作品集」，可一键导出 PDF 发给 HR。
          </div>
        </div>
      </section>

      {/* ========================= Testimonials ========================= */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-14 text-center">
            <div className="eyebrow">学员说</div>
            <h2 className="mt-3 font-display text-4xl font-bold">来自学员的真实反馈</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "张同学", school: "复旦大学 · 金融硕士", quote: "面试的时候 MD 问我 SaaS 估值，我直接把入行里学的 ARR、NDR、Magic Number 全讲了一遍，offer 拿到了。" },
              { name: "李同学", school: "上交大 · 经济本科", quote: "做了一遍 PE 的尽调和投委会 Memo，第一次知道 PE 真正在想什么，比看十本书都管用。" },
              { name: "王同学", school: "人大 · 财政金融", quote: "从来没有产品能让我凌晨三点还在回 AI 上级的消息，又紧张又上头。" },
            ].map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass relative rounded-2xl p-6 transition hover:border-primary/20"
              >
                <Quote className="h-6 w-6 text-primary/40" />
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-sm font-medium text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.school}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16">
            <div className="mb-5 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              来自这些高校的学员
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
              {["北大", "清华", "复旦", "上交", "人大", "中大", "南大", "浙大"].map((s) => (
                <div key={s} className="font-display text-base text-muted-foreground">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= CTA ========================= */}
      <section className="relative py-28">
        <div className="container mx-auto px-6">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-surface-1 p-12 text-center shadow-deep">
            <div className="absolute inset-0 halo-gold opacity-80" />
            <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="eyebrow">现在开始</div>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
                今天，开始你的<span className="text-gradient-gold">第一个项目</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
                免费体验完整 IB IPO 模拟。注册即可开启，不需要信用卡。
              </p>
              <Button
                asChild
                size="lg"
                className="mt-9 bg-gradient-gold text-primary-foreground shadow-glow-gold hover:opacity-95 px-10 h-12"
              >
                <Link to={ctaTo}>
                  免费开始模拟 <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 永久免费体验</span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 无需信用卡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
