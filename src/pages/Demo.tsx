import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  Paperclip,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import {
  DEMO_AI_FEEDBACK,
  DEMO_EMAIL,
  DEMO_LEADER,
  DEMO_MESSAGES,
  DEMO_PROJECT,
  DEMO_TASKS,
  type DemoMessage,
} from "@/data/demo-script";

const lockedToast = () =>
  toast.info("Demo 模式只读", {
    description: "这是产品体验预览，注册后即可解锁完整工作台、提交作业、获取 AI 反馈。",
    action: { label: "免费注册", onClick: () => (window.location.href = "/register") },
    duration: 5000,
  });

export default function Demo() {
  // 自动播放消息
  const [visible, setVisible] = useState<DemoMessage[]>([]);
  const [typing, setTyping] = useState<"leader" | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    document.title = "产品 Demo · 入行";
    let cum = 0;
    DEMO_MESSAGES.forEach((m) => {
      cum += m.delay;
      // typing 提示出现在消息前 600ms
      if (m.from === "leader") {
        const t1 = window.setTimeout(() => setTyping("leader"), Math.max(0, cum - 600));
        timers.current.push(t1);
      }
      const t2 = window.setTimeout(() => {
        setTyping(null);
        setVisible((prev) => [...prev, m]);
      }, cum);
      timers.current.push(t2);
    });
    return () => {
      timers.current.forEach((id) => clearTimeout(id));
      timers.current = [];
    };
  }, []);

  const overallStars = useMemo(() => Math.round(DEMO_AI_FEEDBACK.scoreOverall / 20), []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-6">
        {/* Banner */}
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground">
                你正在体验<span className="text-primary font-medium">产品 Demo</span>
              </span>
              <span className="hidden text-muted-foreground sm:inline">
                · 这是真实工作台的只读预览，所有提交按钮已禁用
              </span>
            </div>
            <Button asChild size="sm" className="gradient-gold text-primary-foreground border-0 hover:opacity-90">
              <Link to="/register">
                免费开始真正的项目 <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Workspace mock */}
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-strong relative grid grid-cols-12 overflow-hidden rounded-3xl border border-primary/15 shadow-deep min-h-[640px]"
          >
            {/* ===== 左：会话列表 ===== */}
            <aside className="col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">会话</div>
                <span className="dot-unread" />
              </div>
              <div className="space-y-1.5">
                <div className="rounded-lg border-l-2 border-primary bg-primary/10 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">{DEMO_LEADER.name} · VP</div>
                    <span className="dot-unread" />
                  </div>
                  <div className="mt-1 text-muted-foreground line-clamp-1">明早立项会要用，今晚 9 点前发我</div>
                </div>
                <div className="rounded-lg p-3 text-xs row-read">
                  <div className="text-foreground">兴通 IPO 项目组</div>
                  <div className="mt-1 text-muted-foreground line-clamp-1">@all 模板已上传共享盘</div>
                </div>
                <div className="rounded-lg p-3 text-xs row-read">
                  <div className="text-foreground">人力资源部</div>
                  <div className="mt-1 text-muted-foreground line-clamp-1">入职手续已完成</div>
                </div>
              </div>

              <div className="mt-6 hairline-gold" />
              <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">邮件</div>
              <button
                onClick={lockedToast}
                className="mt-2 w-full rounded-lg border border-primary/15 bg-secondary/20 p-3 text-left text-xs hover:border-primary/30 transition"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <Mail className="h-3 w-3" /> 立项 · 行业研究
                </div>
                <div className="mt-1 text-muted-foreground line-clamp-2">{DEMO_EMAIL.preview}</div>
              </button>
            </aside>

            {/* ===== 中：聊天 ===== */}
            <section className="col-span-12 md:col-span-6 flex flex-col p-4">
              {/* 顶栏 */}
              <header className="mb-4 flex items-center gap-2 border-b border-white/5 pb-3 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
                  {DEMO_LEADER.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{DEMO_LEADER.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 在线 · {DEMO_LEADER.title}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground hidden sm:block">{DEMO_PROJECT.day}</div>
              </header>

              {/* 消息流 */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {visible.map((m) => {
                  if (m.from === "leader") {
                    return (
                      <div key={m.id} className="space-y-2">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 p-3 text-xs leading-relaxed text-foreground">
                          {m.text}
                        </div>
                        {m.taskCard && (
                          <div className="card-material text-xs max-w-[85%]">
                            <div className="mb-1 eyebrow">📌 任务</div>
                            <div className="font-medium text-foreground">{m.taskCard.title}</div>
                            <div className="mt-1 text-muted-foreground">截止 {m.taskCard.deadline}</div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={m.id}
                      className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-gold p-3 text-xs text-primary-foreground"
                    >
                      {m.text}
                    </div>
                  );
                })}

                {typing === "leader" && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="typing-dot inline-block h-1 w-1 rounded-full bg-primary" />
                    <span className="typing-dot inline-block h-1 w-1 rounded-full bg-primary" />
                    <span className="typing-dot inline-block h-1 w-1 rounded-full bg-primary" />
                    <span className="ml-1">{DEMO_LEADER.name} 正在输入…</span>
                  </div>
                )}
              </div>

              {/* 输入区（禁用） */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-secondary/30 p-2">
                <button
                  onClick={lockedToast}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  readOnly
                  onClick={lockedToast}
                  placeholder="注册后即可输入消息、上传文件、提交作业…"
                  className="flex-1 bg-transparent px-2 text-xs text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none cursor-pointer"
                />
                <button
                  onClick={lockedToast}
                  className="flex h-8 items-center gap-1 rounded-lg bg-gradient-gold px-3 text-xs text-primary-foreground"
                >
                  <Send className="h-3 w-3" /> 发送
                </button>
              </div>
            </section>

            {/* ===== 右：任务面板 + AI 反馈 ===== */}
            <aside className="col-span-12 md:col-span-3 border-t md:border-t-0 md:border-l border-white/5 p-4">
              {/* 项目信息 */}
              <div className="mb-4 rounded-xl border border-primary/15 bg-primary/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-primary">当前项目</div>
                <div className="mt-1 text-xs font-medium text-foreground">{DEMO_PROJECT.title}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">客户：{DEMO_PROJECT.client}</div>
              </div>

              {/* 任务进度 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">任务进度</div>
                <div className="font-mono text-[10px] text-primary">20%</div>
              </div>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-1/5 rounded-full bg-gradient-gold" />
              </div>

              <div className="space-y-2 text-xs">
                {DEMO_TASKS.map((t) =>
                  t.status === "doing" ? (
                    <button
                      key={t.id}
                      onClick={lockedToast}
                      className="w-full flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-2 text-left text-primary hover:bg-primary/15 transition"
                    >
                      <span className="dot-unread" />
                      <span className="flex-1">{t.name}</span>
                      <FileText className="h-3 w-3" />
                    </button>
                  ) : (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground/70"
                    >
                      <Lock className="h-3 w-3" />
                      <span className="flex-1">{t.name}</span>
                    </div>
                  ),
                )}
              </div>

              {/* AI 反馈预览 */}
              <div className="mt-6 hairline-gold" />
              <div className="mt-3 mb-2 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI 反馈预览</div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < overallStars
                          ? "h-3 w-3 fill-primary text-primary"
                          : "h-3 w-3 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-3 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-muted-foreground">综合得分</span>
                  <span className="font-display text-lg font-bold text-gradient-gold">
                    {DEMO_AI_FEEDBACK.scoreOverall}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {DEMO_AI_FEEDBACK.dimensions.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="text-foreground">
                          {d.score}/{d.max}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-gold"
                          style={{ width: `${(d.score / d.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </motion.div>

          {/* 反馈详情卡 */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-foreground">做得好的地方</h3>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                {DEMO_AI_FEEDBACK.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-emerald-400">·</span> {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">可以再优化</h3>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                {DEMO_AI_FEEDBACK.improvements.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-primary">·</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 relative overflow-hidden rounded-3xl border border-primary/30 bg-surface-1 p-10 text-center shadow-deep">
            <div className="absolute inset-0 halo-gold opacity-60" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold leading-tight">
                看完了 Demo？现在<span className="text-gradient-gold">真正"上班"</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                注册即可免费体验完整的「兴通投行 IPO」项目，包含 6 天任务、AI 反馈、能力报告与结业证书。
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-gradient-gold px-8 text-primary-foreground shadow-glow-gold hover:opacity-95"
                >
                  <Link to="/register">
                    免费开始 <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12">
                  <Link to="/pricing">查看付费套餐</Link>
                </Button>
              </div>
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 永久免费体验
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 无需信用卡
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
