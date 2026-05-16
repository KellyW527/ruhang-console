import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Search, Sparkles, CheckCircle2, Clock3, Lock } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUserAccess } from "@/hooks/useUserAccess";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SIMULATION_CATALOG,
  SIMULATION_TRACKS,
  type CatalogEntry,
  type SimulationTrack,
} from "@/data/simulation-catalog";
import logoImg from "@/assets/logo.png";

type SimRow = {
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

type UserSimRow = {
  simulation_id: string;
  status: string;
  offer_accepted: boolean;
};

type LibraryItem = CatalogEntry & {
  simulationId: string | null;
  userStatus: "not_started" | "in_progress" | "completed";
  offerAccepted: boolean;
  locked: boolean;
};

type FilterKey = SimulationTrack | "all";

export default function Library() {
  const { user } = useAuth();
  const { hasAccess, subscription, refresh: refreshAccess } = useUserAccess();
  const nav = useNavigate();
  const [dbSims, setDbSims] = useState<SimRow[]>([]);
  const [userSims, setUserSims] = useState<UserSimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    document.title = "项目库 · 入行";
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: sims } = await supabase
        .from("simulations")
        .select("id, code, title, company, role, track, description, cover_emoji, duration_label, is_pro");

      setDbSims((sims ?? []) as SimRow[]);

      if (user) {
        const { data: us } = await supabase
          .from("user_simulations")
          .select("simulation_id, status, offer_accepted")
          .eq("user_id", user.id);
        setUserSims((us ?? []) as UserSimRow[]);
      }
      setLoading(false);
    };
    void load();
  }, [user]);

  const items: LibraryItem[] = useMemo(() => {
    return SIMULATION_CATALOG.map((entry) => {
      const dbSim = dbSims.find((s) => s.code === entry.code);
      const userSim = dbSim ? userSims.find((u) => u.simulation_id === dbSim.id) : undefined;
      let userStatus: LibraryItem["userStatus"] = "not_started";
      if (userSim) {
        if (userSim.status === "completed") userStatus = "completed";
        else if (userSim.offer_accepted || userSim.status === "in_progress") userStatus = "in_progress";
      }
      return {
        ...entry,
        simulationId: dbSim?.id ?? null,
        userStatus,
        offerAccepted: Boolean(userSim?.offer_accepted),
        // 已经在做或做完的项目不锁，否则用 hasAccess 判断
        locked: userStatus === "not_started" && !hasAccess(entry.code),
      };
    });
  }, [dbSims, userSims, hasAccess]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.track !== filter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, filter, query]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    SIMULATION_TRACKS.forEach((t) => {
      if (t.key === "all") return;
      counts[t.key] = items.filter((i) => i.track === t.key).length;
    });
    return counts;
  }, [items]);

  const handleStart = async (item: LibraryItem) => {
    if (!user) {
      nav("/login");
      return;
    }
    if (!item.simulationId) {
      toast.error("该项目还没在后端就绪，请稍后再试。");
      return;
    }

    // 已开始 → 直接进对应入口（已经有 entitlement 或开始过的项目继续可用）
    if (item.userStatus !== "not_started") {
      nav(item.offerAccepted ? `/simulation/${item.simulationId}` : `/simulation/${item.simulationId}/offer`);
      return;
    }

    // 未开始 + 锁定 → 用配额兑换 / 引导付费
    if (item.locked) {
      // 有套餐配额 → 调 redeem-quota 真正解锁
      if (subscription && subscription.quotaRemaining > 0) {
        const confirmed = window.confirm(
          `用 1 个配额解锁「${item.title}」吗？\n\n当前剩余：${subscription.quotaRemaining} / ${subscription.quotaTotal}`,
        );
        if (!confirmed) return;
        setStarting(item.code);
        try {
          const { data, error } = await supabase.functions.invoke("redeem-quota", {
            body: { simulation_code: item.code },
          });
          if (error || (data as { error?: string })?.error) {
            const msg = (data as { error?: string })?.error ?? error?.message ?? "解锁失败，请稍后再试。";
            toast.error(msg);
            return;
          }
          toast.success(`「${item.title}」已解锁！`);
          await refreshAccess();
        } finally {
          setStarting(null);
        }
        return;
      }
      // 无配额 → 引导去定价页
      toast.info("这是会员项目", {
        description: "免费用户只能体验「兴通投行 IPO」。升级会员或单买额度解锁。",
        action: { label: "查看定价", onClick: () => nav("/pricing") },
        duration: 6000,
      });
      return;
    }

    // 未开始 + 已解锁 → 直接跳 Offer 页（行将在用户点"接受 Offer"时再创建）
    setStarting(item.code);
    try {
      nav(`/simulation/${item.simulationId}/offer`);
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0 halo-blue opacity-30" />
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 halo-gold opacity-60 blur-3xl" />

      <main className="relative">
        <div className="container mx-auto px-4 py-6 md:px-6">
          {/* Header */}
          <header className="glass-strong rounded-[30px] border-white/10 px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="入行" className="h-11 w-11 rounded-2xl object-contain" />
                <div>
                  <div className="font-display text-lg font-semibold">项目库</div>
                  <div className="text-xs text-muted-foreground">入行全部沉浸式金融模拟项目</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/5">
                  <Link to="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回控制台
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Hero */}
          <section className="mt-6 glass-deep relative overflow-hidden rounded-[36px] p-6 md:p-8">
            <div className="absolute inset-0 halo-gold opacity-30" />
            <div className="relative max-w-3xl">
              <div className="eyebrow">入行项目库</div>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
                选一个真实岗位，开始你的下一段模拟。
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                每个项目都按真实公司、真实任务节奏构建。不接 mock 数据，不刷题。从 Offer Letter 开始，到结项报告结束。
              </p>

              {/* Search + Tabs */}
              <div className="mt-6 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索项目名 / 公司 / 标签…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="rounded-full border-white/10 bg-white/[0.04] pl-10 backdrop-blur-xl placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {SIMULATION_TRACKS.map((t) => {
                    const active = filter === t.key;
                    const count = tabCounts[t.key] ?? 0;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setFilter(t.key as FilterKey)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                          active
                            ? "border-primary/40 bg-primary/15 text-primary shadow-glow-gold"
                            : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                        )}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] tabular-nums", active ? "bg-primary/25 text-primary" : "bg-white/5 text-muted-foreground")}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Grid */}
          <section className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass h-72 rounded-[28px] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-20 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="font-display text-lg font-medium text-white">该条线暂无项目</div>
                <div className="mt-1.5 max-w-sm text-sm leading-7 text-muted-foreground">
                  入行正在持续上线新项目，敬请期待。
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((item) => (
                  <LibraryCard
                    key={item.code}
                    item={item}
                    starting={starting === item.code}
                    onStart={() => handleStart(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function LibraryCard({
  item,
  starting,
  onStart,
}: {
  item: LibraryItem;
  starting: boolean;
  onStart: () => void;
}) {
  const ctaLabel =
    item.userStatus === "completed"
      ? "回看结项"
      : item.userStatus === "in_progress"
        ? item.offerAccepted ? "继续模拟" : "查看 Offer"
        : "开始项目";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex-1 px-6 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-2xl">
            {item.coverEmoji}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={item.userStatus} />
            {item.isPro && <span className="badge-pro">PRO</span>}
          </div>
        </div>

        <div className="mt-5">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-primary">
            {item.trackLabel}
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-white">{item.title}</h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {item.company} · {item.role}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>📅 {item.durationLabel}</span>
          <span className="opacity-40">·</span>
          <span>难度 {item.difficulty}</span>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/10 px-6 py-4">
        <button
          type="button"
          onClick={onStart}
          disabled={starting || !item.simulationId}
          className={cn(
            "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium transition",
            item.locked
              ? "border border-primary/25 bg-primary/[0.08] text-primary hover:bg-primary/[0.12]"
              : item.userStatus === "not_started"
                ? "bg-gradient-gold text-primary-foreground group-hover:shadow-glow-gold"
                : "border border-white/10 bg-white/[0.04] text-foreground hover:bg-white/[0.08]",
            (starting || !item.simulationId) && "cursor-not-allowed opacity-60",
          )}
        >
          {item.locked ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              升级解锁
            </>
          ) : (
            <>
              {starting ? "启动中…" : ctaLabel}
              {!starting && <ArrowRight className="h-3.5 w-3.5" />}
            </>
          )}
        </button>
        {!item.simulationId && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            后端尚未就绪
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: LibraryItem["userStatus"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        已完成
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
        <Clock3 className="h-3 w-3" />
        进行中
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
      未开始
    </span>
  );
}
