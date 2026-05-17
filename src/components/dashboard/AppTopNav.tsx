import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Award, BookOpen, LayoutDashboard, Library as LibraryIcon, LogOut, Menu, Settings as SettingsIcon, Sparkles } from "lucide-react";

import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUserAccess } from "@/hooks/useUserAccess";
import { cn } from "@/lib/utils";
import { buildAchievementStates, type AchievementProgressRow } from "@/data/achievements";
import { getPreferredDisplayName } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "控制台", to: "/dashboard", icon: LayoutDashboard },
  { label: "项目库", to: "/library", icon: LibraryIcon },
  { label: "能力报告", to: "/report", icon: BookOpen },
  { label: "我的勋章", to: "#", icon: Award, medal: true },
  { label: "设置", to: "/settings", icon: SettingsIcon },
];

function MedalDialog({
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
      <DialogContent className="glass-strong max-h-[85vh] max-w-3xl overflow-y-auto border-white/10">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">我的勋章</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="text-sm text-muted-foreground">当前已解锁</div>
            <div className="mt-2 font-display text-3xl text-primary">{unlocked.length} / {achievements.length}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={cn("rounded-2xl border p-4", item.unlocked ? "border-primary/25 bg-primary/8" : "border-white/10 bg-white/[0.02]")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-lg">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{item.rarity}</span>
                </div>
                <div className="mt-4 text-xs text-foreground/85">{item.condition}</div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  {item.unlocked ? `已解锁${item.unlockedAt ? ` · ${new Date(item.unlockedAt).toLocaleDateString("zh-CN")}` : ""}` : "未解锁"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AppTopNav({
  achievementRows,
  onOpenMedals,
}: {
  achievementRows?: AchievementProgressRow[];
  onOpenMedals?: () => void;
}) {
  const loc = useLocation();
  const { user, profile, signOut } = useAuth();
  const { subscription } = useUserAccess();
  const [medalOpen, setMedalOpen] = useState(false);
  const [fetchedRows, setFetchedRows] = useState<AchievementProgressRow[]>([]);

  const name = getPreferredDisplayName(profile ?? null, user?.email) ?? "新同学";
  const plan = subscription?.isActive ? "pro" : profile?.plan ?? "free";
  const rows = achievementRows ?? fetchedRows;
  const title = loc.pathname === "/library" ? "项目库" : "入行";
  const subtitle = loc.pathname === "/library" ? "入行全部沉浸式金融模拟项目" : "真实岗位节奏驱动的金融工作台";

  useEffect(() => {
    if (achievementRows || !user?.id) return;
    let cancelled = false;
    const load = async () => {
      const { data: userSimulations } = await supabase
        .from("user_simulations")
        .select("id")
        .eq("user_id", user.id);
      const ids = (userSimulations ?? []).map((item: any) => item.id);
      if (!ids.length) {
        if (!cancelled) setFetchedRows([]);
        return;
      }
      const { data } = await supabase
        .from("user_task_progress")
        .select(`
          status,
          score,
          submitted_at,
          self_eval,
          task:tasks(order_index, title),
          user_simulation:user_simulations(status, offer_accepted, simulation:simulations(code))
        `)
        .in("user_simulation_id", ids);
      if (cancelled) return;
      const normalized = (data ?? []).map((row: any) => ({
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
      setFetchedRows(normalized);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [achievementRows, user?.id]);

  const openMedals = () => {
    if (onOpenMedals) onOpenMedals();
    else setMedalOpen(true);
  };

  const navButton = (item: (typeof NAV_ITEMS)[number], compact = false) => {
    const active = !item.medal && loc.pathname === item.to;
    const className = cn(
      compact
        ? "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
        : "rounded-full px-5 py-2 text-sm font-medium transition",
      active
        ? "bg-primary/20 text-primary"
        : "text-muted-foreground hover:bg-white/8 hover:text-foreground",
    );

    if (item.medal) {
      return (
        <button key={item.label} type="button" onClick={openMedals} className={className}>
          {compact && <item.icon className="h-4 w-4" />}
          {item.label}
        </button>
      );
    }

    return (
      <Link key={item.label} to={item.to} className={className}>
        {compact && <item.icon className="h-4 w-4" />}
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logoImg} alt="入行" className="h-11 w-11 rounded-2xl object-contain" />
            <div>
              <div className="font-display text-lg font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground">{subtitle}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 lg:flex">
            {NAV_ITEMS.map((item) => navButton(item))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{name}</div>
              <div className={cn("text-[10px] uppercase tracking-[0.2em]", plan === "pro" ? "text-primary" : "text-muted-foreground")}>
                {plan === "pro" ? "高级会员" : "免费版"}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full bg-white/[0.03] px-4 hover:bg-white/5" onClick={() => void signOut()}>
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
              <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
                <div className="flex h-full flex-col">
                  <Link to="/dashboard" className="flex items-center gap-3 px-6 py-6">
                    <img src={logoImg} alt="入行" className="h-10 w-10 rounded-xl object-contain" />
                    <div>
                      <div className="font-display text-lg font-semibold">入行</div>
                      <div className="text-xs text-muted-foreground">金融工作台</div>
                    </div>
                  </Link>
                  <nav className="flex-1 space-y-1 px-3">
                    {NAV_ITEMS.map((item) => navButton(item, true))}
                  </nav>
                  <div className="border-t border-sidebar-border p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      {plan === "pro" && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      {plan === "pro" ? "高级会员" : "免费版"}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-foreground" onClick={() => void signOut()}>
                      <LogOut className="mr-2 h-4 w-4" /> 退出登录
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {!onOpenMedals && <MedalDialog open={medalOpen} onOpenChange={setMedalOpen} rows={rows} />}
    </>
  );
}
