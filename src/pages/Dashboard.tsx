import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trophy,
  Library as LibraryIcon,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getPreferredDisplayName } from "@/lib/settings";
import { buildAchievementStates, type AchievementProgressRow, type AchievementState } from "@/data/achievements";
import { getRecommendedProjects, type CatalogEntry } from "@/data/simulation-catalog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImg from "@/assets/logo.png";

type SimRow = {
  id: string;
  status: string;
  progress: number;
  offer_accepted: boolean;
  current_task_index: number;
  completed_at?: string | null;
  simulation: {
    id: string;
    code: string;
    title: string;
    company: string;
    role: string;
    track: string;
    description: string;
    cover_emoji: string;
    duration_label: string;
    is_pro: boolean;
  };
  total_tasks: number;
  completed_tasks: number;
};

const NAV: { label: string; icon: any; to: string; medal?: boolean }[] = [
  { label: "我的模拟", icon: LayoutDashboard, to: "/dashboard" },
  { label: "项目库", icon: LibraryIcon, to: "/library" },
  { label: "能力报告", icon: BookOpen, to: "/report" },
  { label: "我的勋章", icon: Award, to: "#", medal: true },
  { label: "设置", icon: SettingsIcon, to: "/settings" },
];

function MedalShelf({
  open,
  onOpenChange,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: AchievementProgressRow[];
}) {
  const achievements = useMemo(() => buildAchievementStates(rows), [rows]);
  const unlocked = achievements.filter((item) => item.unlocked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-3xl max-h-[85vh] overflow-y-auto border-white/10">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">我的勋章</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="text-sm text-muted-foreground">当前已解锁</div>
            <div className="mt-2 font-display text-3xl text-primary">{unlocked.length} / {achievements.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              勋章只按系统里可真实计算的行为解锁，不做虚假点亮。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-4",
                  item.unlocked ? "border-primary/25 bg-primary/8" : "border-white/10 bg-white/[0.02]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-lg">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      item.rarity === "史诗"
                        ? "bg-amber-500/15 text-amber-200"
                        : item.rarity === "稀有"
                          ? "bg-sky-500/15 text-sky-200"
                          : "bg-white/10 text-muted-foreground",
                    )}
                  >
                    {item.rarity}
                  </span>
                </div>
                <div className="mt-4 text-xs text-foreground/85">{item.condition}</div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  {item.unlocked
                    ? `已解锁${item.unlockedAt ? ` · ${new Date(item.unlockedAt).toLocaleDateString("zh-CN")}` : ""}`
                    : "未解锁"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const SEEN_MEDALS_KEY = "ruhang_seen_medals";

function getSeenMedals(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_MEDALS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markMedalsSeen(ids: string[]) {
  const existing = getSeenMedals();
  ids.forEach((id) => existing.add(id));
  localStorage.setItem(SEEN_MEDALS_KEY, JSON.stringify([...existing]));
}

function MedalCelebration({
  medals,
  onDone,
}: {
  medals: AchievementState[];
  onDone: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = medals[currentIndex];

  if (!current) return null;

  const isLast = currentIndex >= medals.length - 1;
  const rarityColor =
    current.rarity === "史诗"
      ? "from-amber-400 to-amber-600"
      : current.rarity === "稀有"
        ? "from-sky-400 to-sky-600"
        : "from-zinc-300 to-zinc-500";

  const handleNext = () => {
    if (isLast) {
      onDone();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <Dialog open onOpenChange={() => onDone()}>
      <DialogContent className="glass-strong max-w-md border-white/10 overflow-hidden p-0">
        <div className="relative flex flex-col items-center px-8 py-10">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 halo-gold opacity-60" />
          <div className="pointer-events-none absolute inset-0 halo-blue opacity-30" />

          <motion.div
            key={current.id}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative z-10"
          >
            {/* Medal icon */}
            <div className={cn("mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl", rarityColor)}>
              <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
          </motion.div>

          <motion.div
            key={`text-${current.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mt-6 text-center"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              勋章解锁
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">
              {current.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {current.description}
            </p>
            <span
              className={cn(
                "mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-medium",
                current.rarity === "史诗"
                  ? "bg-amber-500/15 text-amber-200"
                  : current.rarity === "稀有"
                    ? "bg-sky-500/15 text-sky-200"
                    : "bg-white/10 text-muted-foreground",
              )}
            >
              {current.rarity}
            </span>
            <p className="mt-4 text-xs text-foreground/70">{current.condition}</p>
          </motion.div>

          {/* Sparkle particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${current.id}-${i}`}
              className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-primary"
              initial={{
                x: 0, y: 0, opacity: 1, scale: 0,
              }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 120,
                y: Math.sin((i / 8) * Math.PI * 2) * 120,
                opacity: 0,
                scale: 1.5,
              }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              style={{ top: "40%", left: "50%" }}
            />
          ))}

          <div className="relative z-10 mt-8 flex items-center gap-3">
            <Button
              onClick={handleNext}
              className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow-gold"
            >
              {isLast ? "太好了！" : `下一个 (${currentIndex + 1}/${medals.length})`}
            </Button>
          </div>

          {medals.length > 1 && (
            <div className="relative z-10 mt-4 flex gap-1.5">
              {medals.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === currentIndex ? "bg-primary" : "bg-white/20",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarBody({
  name,
  plan,
  onSignOut,
  onOpenMedals,
}: {
  name: string;
  plan: string;
  onSignOut: () => void;
  onOpenMedals: () => void;
}) {
  const loc = useLocation();

  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-6 py-7">
        <img src={logoImg} alt="入行" className="h-9 w-9 rounded-lg object-contain" />
        <span className="font-display text-lg font-semibold">入行 RuHang</span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = !item.medal && item.to !== "#" && loc.pathname === item.to;
          const className = cn(
            "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
            active
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
          );

          const inner = (
            <>
              {active && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-gradient-gold" />}
              <item.icon className="h-4 w-4" />
              {item.label}
            </>
          );

          if (item.medal) {
            return (
              <button key={item.label} type="button" onClick={onOpenMedals} className={className}>
                {inner}
              </button>
            );
          }

          return (
            <Link key={item.label} to={item.to} className={className}>
              {inner}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">
            {(name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className={cn("flex items-center gap-1 text-[10px] uppercase tracking-wider", plan === "pro" ? "text-primary" : "text-muted-foreground")}>
              {plan === "pro" && <Sparkles className="h-3 w-3" />}
              {plan === "pro" ? "PRO 会员" : "免费版"}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-foreground" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> 退出登录
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<SimRow[]>([]);
  const [achievementRows, setAchievementRows] = useState<AchievementProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [medalOpen, setMedalOpen] = useState(false);
  const [celebrationMedals, setCelebrationMedals] = useState<AchievementState[]>([]);

  useEffect(() => {
    document.title = "控制台 · 入行 RuHang";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const { data: userSimulations } = await supabase
        .from("user_simulations")
        .select("id, status, progress, offer_accepted, current_task_index, completed_at, simulation:simulations(*)")
        .eq("user_id", user.id);

      if (!userSimulations) {
        setLoading(false);
        return;
      }

      const enriched: SimRow[] = await Promise.all(
        userSimulations.map(async (simulationRow: any) => {
          const { count: total } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("simulation_id", simulationRow.simulation.id);

          const { count: done } = await supabase
            .from("user_task_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_simulation_id", simulationRow.id)
            .eq("status", "done");

          return {
            ...simulationRow,
            total_tasks: total ?? 0,
            completed_tasks: done ?? 0,
          };
        }),
      );

      setRows(enriched);

      const userSimulationIds = userSimulations.map((item: any) => item.id);
      if (userSimulationIds.length) {
        const { data: progressRows, error: progressError } = await supabase
          .from("user_task_progress")
          .select("status, score, submitted_at, self_eval, task:tasks(order_index, title), user_simulation:user_simulations(status, offer_accepted, simulation:simulations(code))")
          .in("user_simulation_id", userSimulationIds);

        if (progressError) {
          console.error("[Dashboard] achievement query error:", progressError);
        }
        console.log("[Dashboard] progressRows count:", progressRows?.length, "raw sample:", progressRows?.[0]);

        const normalized = (progressRows ?? []).map((row: any) => ({
          simulationCode: row.user_simulation?.simulation?.code ?? "ibd-ipo",
          simulationStatus: row.user_simulation?.status ?? "not_started",
          offerAccepted: Boolean(row.user_simulation?.offer_accepted),
          title: row.task?.title ?? "",
          orderIndex: row.task?.order_index ?? 0,
          status: row.status ?? "locked",
          score: row.score ?? null,
          submissionQuality: null,
          submittedAt: row.submitted_at ?? null,
          selfEvalSubmitted: Boolean(row.self_eval?.submitted_at),
        })) as AchievementProgressRow[];

        console.log("[Dashboard] normalized achievement rows:", normalized.map(r => ({ code: r.simulationCode, simStatus: r.simulationStatus, status: r.status, idx: r.orderIndex })));

        setAchievementRows(normalized);
      } else {
        setAchievementRows([]);
      }

      setLoading(false);
    };

    void load();
  }, [user]);

  // 只显示用户已经"开始"的项目（接收过 Offer 或已完成）
  const startedRows = rows.filter((row) => row.offer_accepted || row.status === "in_progress" || row.status === "completed");
  const inProgress = startedRows.filter((row) => row.status !== "completed");
  const completed = startedRows.filter((row) => row.status === "completed");
  const achievements = useMemo(() => buildAchievementStates(achievementRows), [achievementRows]);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const totalCompletedTasks = startedRows.reduce((sum, row) => sum + row.completed_tasks, 0);
  const spotlight = inProgress[0] ?? startedRows[0] ?? null;
  const recommendations = useMemo(() => getRecommendedProjects(), []);

  // Detect newly unlocked achievements and trigger celebration
  useEffect(() => {
    if (loading || achievements.length === 0) return;
    const unlocked = achievements.filter((a) => a.unlocked);
    if (unlocked.length === 0) return;
    const seen = getSeenMedals();
    const newlyUnlocked = unlocked.filter((a) => !seen.has(a.id));
    if (newlyUnlocked.length > 0) {
      setCelebrationMedals(newlyUnlocked);
      markMedalsSeen(newlyUnlocked.map((a) => a.id));
    }
  }, [loading, achievements]);

  const onSignOut = async () => {
    await signOut();
    nav("/");
  };

  // TODO: Pro gate — temporarily bypassed for testing
  const continueLink = (row: SimRow) =>
    row.offer_accepted
      ? `/simulation/${row.simulation.id}`
      : `/simulation/${row.simulation.id}/offer`;

  const name = getPreferredDisplayName(profile ?? null, user?.email) ?? "新同学";
  const plan = profile?.plan ?? "free";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0 halo-blue opacity-40" />
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 halo-gold opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full halo-blue blur-3xl" />

      <main className="relative">
        <div className="container mx-auto px-4 py-4 md:px-6 lg:py-6">
          <header className="glass-strong rounded-[30px] border-white/10 px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="入行" className="h-11 w-11 rounded-2xl object-contain" />
                <div>
                  <div className="font-display text-lg font-semibold">入行 RuHang</div>
                  <div className="text-xs text-muted-foreground">真实岗位节奏驱动的金融工作台</div>
                </div>
              </div>

              <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 lg:flex">
                <Link to="/dashboard" className="rounded-full bg-primary/20 px-5 py-2 text-sm font-medium text-primary">
                  控制台
                </Link>
                <Link to="/report" className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/8 hover:text-foreground">
                  能力报告
                </Link>
                <button
                  type="button"
                  onClick={() => setMedalOpen(true)}
                  className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/8 hover:text-foreground"
                >
                  我的勋章
                </button>
                <Link to="/settings" className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/8 hover:text-foreground">
                  设置
                </Link>
              </nav>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                  <div className="text-sm font-medium text-foreground">{name}</div>
                  <div className={cn("text-[10px] uppercase tracking-[0.2em]", plan === "pro" ? "text-primary" : "text-muted-foreground")}>
                    {plan === "pro" ? "PRO MEMBER" : "FREE PLAN"}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full border border-white/10 bg-white/[0.03] px-4 hover:bg-white/5" onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出
                </Button>
              </div>

              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/5">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
                    <SidebarBody
                      name={name}
                      plan={plan}
                      onSignOut={onSignOut}
                      onOpenMedals={() => setMedalOpen(true)}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.92fr]">
            <div className="glass-deep relative overflow-hidden rounded-[36px] p-6 md:p-8">
              <div className="absolute inset-0 halo-gold opacity-40" />
              <div className="absolute inset-y-0 right-0 w-1/2 halo-blue opacity-50" />
              <div className="relative">
                <div className="eyebrow">RuHang Control Room</div>
                <div className="mt-4 max-w-3xl">
                  <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
                    {name}，下一段金融工作线已经排好。
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    这里不是传统课程后台，而是一套围绕真实岗位推进的工作界面。继续你正在跑的模拟，或者沿着新的赛道，把 Offer、任务、反馈和能力沉淀都接回同一条主线。
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard icon={<Clock3 className="h-4 w-4" />} label="推进中的项目" value={String(inProgress.length)} accent />
                  <KpiCard icon={<CheckCircle2 className="h-4 w-4" />} label="已结项模拟" value={String(completed.length)} />
                  <KpiCard icon={<ShieldCheck className="h-4 w-4" />} label="累计完成任务" value={String(totalCompletedTasks)} suffix="个" />
                  <KpiCard icon={<Trophy className="h-4 w-4" />} label="已点亮勋章" value={String(unlockedCount)} suffix={`/ ${achievements.length}`} />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {spotlight ? (
                    <Link
                      to={continueLink(spotlight)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow-gold"
                    >
                      {spotlight.offer_accepted
                          ? "继续当前项目"
                          : "查看 Offer Letter"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow-gold"
                    >
                      浏览全部赛道
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link to="/report" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-foreground transition hover:bg-white/[0.08]">
                    打开能力报告
                  </Link>
                  {plan !== "pro" && (
                    <Link
                      to="/pricing"
                      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm text-primary transition hover:bg-primary/15"
                    >
                      <Sparkles className="h-4 w-4" />
                      升级 PRO 解锁全部赛道
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <section className="glass relative overflow-hidden rounded-[36px] border-white/10 p-6 md:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="eyebrow">推荐项目</div>
              {spotlight ? (
                <div className="mt-4 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                      {spotlight.simulation.cover_emoji}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
                        {spotlight.simulation.track}
                      </span>
                      {spotlight.simulation.is_pro && <span className="badge-status badge-pro px-3 py-1 text-[10px]">PRO</span>}
                    </div>
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-white">
                    {spotlight.simulation.title}
                  </h2>
                  <p className="mt-2 text-sm text-foreground/85">
                    {spotlight.simulation.company} · {spotlight.simulation.role}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {spotlight.simulation.description}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <SpotlightMetric label="项目状态" value={spotlight.offer_accepted ? "已入组" : "待接收 Offer"} />
                    <SpotlightMetric label="任务推进" value={`${spotlight.completed_tasks} / ${spotlight.total_tasks}`} />
                    <SpotlightMetric label="项目周期" value={spotlight.simulation.duration_label} />
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>项目推进度</span>
                      <span className="font-mono text-primary">{spotlight.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${spotlight.progress}%` }} />
                    </div>
                  </div>

                  <Link
                    to={continueLink(spotlight)}
                    className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-foreground transition hover:bg-white/[0.08]"
                  >
                    查看项目工作台
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <EmptyState title="还没有可继续的项目" desc="从任一赛道开始，你的控制台会自动生成项目推进、反馈和能力沉淀入口。" />
              )}
            </section>
          </section>

          <section className="mt-6">
            <div className="glass rounded-[32px] border-white/10 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="eyebrow">赛道矩阵</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold">你的模拟线路</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    每条卡片都继续连接真实的项目入口、任务进度和 Offer 状态，不接 mock 数据。
                  </p>
                </div>
                <Link to="/" className="text-xs text-primary transition hover:underline">
                  回到首页查看赛道 →
                </Link>
              </div>

              {loading ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass h-64 rounded-[28px] animate-pulse" />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <div className="mt-5">
                  <EmptyState title="还没有模拟线" desc="开始第一条赛道后，这里会按真实项目节奏展示你的全部线路。" />
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {rows.map((r) => (
                    <SimCard key={r.id} row={r} to={continueLink(r)} plan={plan} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6">
            <section className="glass rounded-[32px] border-white/10 p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="eyebrow">结项回看</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold">已完成项目</h2>
                </div>
                <button type="button" onClick={() => setMedalOpen(true)} className="text-xs text-primary transition hover:underline">
                  打开我的勋章 →
                </button>
              </div>

              {completed.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    icon={<Trophy className="h-6 w-6 text-primary" />}
                    title="还没有完成的项目"
                    desc="完成第一条模拟线后，这里会展示你的结项项目与回看入口。"
                  />
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {completed.map((r) => (
                    <CompletedCard key={r.id} row={r} />
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </main>

      <MedalShelf open={medalOpen} onOpenChange={setMedalOpen} rows={achievementRows} />
      {celebrationMedals.length > 0 && (
        <MedalCelebration
          medals={celebrationMedals}
          onDone={() => setCelebrationMedals([])}
        />
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("rounded-[24px] border p-5 backdrop-blur-xl", accent ? "border-primary/20 bg-primary/10" : "border-white/10 bg-white/[0.04]")}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span className={accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        {label}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className={cn("font-display text-3xl font-semibold tabular-nums", accent ? "text-gradient-gold" : "text-white")}>
          {value}
        </span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function SpotlightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-xl text-white">{value}</div>
    </div>
  );
}


function SimCard({ row, to, plan }: { row: SimRow; to: string; plan: string }) {
  const pct = row.total_tasks ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0;
  const sim = row.simulation;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      </div>
      <div className="relative px-6 pb-5 pt-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-2xl">
            {sim.cover_emoji}
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">{sim.track}</span>
            {sim.is_pro && <span className="badge-pro">PRO</span>}
          </div>
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-white">{sim.title}</h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{sim.company} · {sim.role}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{sim.description}</p>
      </div>

      <div className="mt-auto border-t border-white/5 bg-black/10 px-6 py-4">
        {!row.offer_accepted ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-primary">待接收</div>
              <div className="text-xs text-foreground">Offer Letter 已送达</div>
            </div>
            <Link
              to={to}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-3.5 py-2 text-xs font-medium text-primary-foreground transition group-hover:shadow-glow-gold"
            >
              查看 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">进度 {row.completed_tasks} / {row.total_tasks}</span>
              <span className="font-mono text-primary">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
            </div>
            <Link to={to} className="mt-4 inline-flex items-center gap-1 text-xs text-primary transition group-hover:gap-2">
              {sim.is_pro && plan !== "pro" ? "进入模拟" : "继续模拟"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CompletedCard({ row }: { row: SimRow }) {
  const sim = row.simulation;
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-emerald-500/15 bg-emerald-500/5 p-6 backdrop-blur-xl">
      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-2xl">
        {sim.cover_emoji}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-white">{sim.title}</h3>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{sim.company} · {sim.role}</p>
      <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4 text-xs">
        <span className="badge-done">已完成</span>
        <span className="text-muted-foreground">{row.completed_tasks} / {row.total_tasks} 任务</span>
        <Link to={`/simulation/${sim.id}`} className="ml-auto text-primary hover:underline">
          回看 →
        </Link>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>
      <div className="font-display text-lg font-medium text-white">{title}</div>
      <div className="mt-1.5 max-w-sm text-sm leading-7 text-muted-foreground">{desc}</div>
    </div>
  );
}
