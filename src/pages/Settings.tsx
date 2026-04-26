import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Crown,
  Download,
  Loader2,
  Lock,
  LogOut,
  ShieldAlert,
  Sliders,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useUserAccess } from "@/hooks/useUserAccess";
import {
  DEFAULT_PROFILE_NOTIFICATIONS,
  DEFAULT_PROFILE_PREFERENCES,
  applyFeedbackStyleTemplate,
  getPreferredDisplayName,
  normalizeNotifications,
  normalizePreferences,
  type FeedbackStyle,
  type ProfileNotifications,
  type ProfilePreferences,
} from "@/lib/settings";

type SectionKey = "account" | "preferences" | "notifications" | "subscription" | "data";

type UserSimulationRow = {
  id: string;
  status: string;
  offer_accepted: boolean;
  progress: number;
  completed_at: string | null;
  simulation: {
    id: string;
    title: string;
    code: string;
    track: string;
    is_pro: boolean;
    cover_emoji: string;
  };
};

type ReportRow = {
  score: number | null;
  status: string;
  task: {
    title: string;
    scoring_rubric: { dim: string; score: number; max: number }[];
    simulation_id: string;
  };
  user_simulation_id: string;
};

const SECTIONS: { key: SectionKey; label: string; icon: typeof User; desc: string }[] = [
  { key: "account", label: "账户", icon: User, desc: "个人资料与登录" },
  { key: "preferences", label: "模拟偏好", icon: Sliders, desc: "你的训练节奏" },
  { key: "notifications", label: "通知", icon: Bell, desc: "提醒与触达" },
  { key: "subscription", label: "订阅与权益", icon: Crown, desc: "套餐与解锁状态" },
  { key: "data", label: "数据与隐私", icon: ShieldAlert, desc: "导出与重置" },
];

const gradeOptions = ["大一", "大二", "大三", "大四", "研一", "研二", "研三", "已工作"];

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const nav = useNavigate();

  const [active, setActive] = useState<SectionKey>("account");
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [resettingSim, setResettingSim] = useState(false);
  const [rows, setRows] = useState<UserSimulationRow[]>([]);
  const [selectedResetId, setSelectedResetId] = useState<string>("");

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState("");
  const [preferences, setPreferences] = useState<ProfilePreferences>(DEFAULT_PROFILE_PREFERENCES);
  const [notifications, setNotifications] = useState<ProfileNotifications>(DEFAULT_PROFILE_NOTIFICATIONS);

  useEffect(() => {
    document.title = "设置 · 入行 RuHang";
  }, []);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setDisplayName(profile.display_name ?? "");
    setChineseName(profile.chinese_name ?? "");
    setEnglishName(profile.english_name ?? "");
    setSchool(profile.school ?? "");
    setMajor(profile.major ?? "");
    setGrade(profile.grade ?? "");
    setPreferences(normalizePreferences(profile.preferences));
    setNotifications(normalizeNotifications(profile.notifications));
  }, [profile]);

  useEffect(() => {
    const loadRows = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_simulations")
        .select("id, status, offer_accepted, progress, completed_at, simulation:simulations(id, title, code, track, is_pro, cover_emoji)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      const nextRows = (data ?? []) as unknown as UserSimulationRow[];
      setRows(nextRows);
      const current =
        nextRows.find((item) => item.status === "in_progress") ??
        nextRows.find((item) => item.offer_accepted) ??
        nextRows[0];
      if (current) setSelectedResetId(current.id);
    };
    void loadRows();
  }, [user]);

  const { subscription, entitlements } = useUserAccess();
  const tier = subscription?.tier ?? null; // 'basic' | 'premium' | null
  const isPro = tier !== null || profile?.plan === "pro"; // 兼容老 plan 字段
  const isPremium = tier === "premium";
  const preferredName = getPreferredDisplayName(profile ?? null, user?.email);
  const resetTarget = rows.find((item) => item.id === selectedResetId) ?? null;

  const saveAccount = async () => {
    if (!user) return;
    setSavingAccount(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name || null,
        display_name: displayName || null,
        chinese_name: chineseName || null,
        english_name: englishName || null,
        school: school || null,
        major: major || null,
        grade: grade || null,
      } as never)
      .eq("id", user.id);
    setSavingAccount(false);
    if (error) {
      toast.error("账户信息保存失败");
      return;
    }
    await refreshProfile();
    toast.success("账户信息已更新");
  };

  const savePreferences = async (next: ProfilePreferences) => {
    if (!user) return;
    setPreferences(next);
    setSavingPrefs(true);
    const { error } = await supabase
      .from("profiles")
      .update({ preferences: next } as never)
      .eq("id", user.id);
    setSavingPrefs(false);
    if (error) {
      toast.error("模拟偏好保存失败");
      return;
    }
    await refreshProfile();
    toast.success("模拟偏好已更新");
  };

  const saveNotifications = async (next: ProfileNotifications) => {
    if (!user) return;
    setNotifications(next);
    setSavingNotif(true);
    const { error } = await supabase
      .from("profiles")
      .update({ notifications: next } as never)
      .eq("id", user.id);
    setSavingNotif(false);
    if (error) {
      toast.error("通知设置保存失败");
      return;
    }
    await refreshProfile();
    toast.success("通知设置已更新");
  };

  const handleSignOut = async () => {
    await signOut();
    nav("/");
  };

  const exportRecords = async () => {
    if (!user) return;
    const { data: simulations } = await supabase
      .from("user_simulations")
      .select("id, status, progress, offer_accepted, completed_at, simulation:simulations(code, title, track, role, company)")
      .eq("user_id", user.id);
    const simulationIds = (simulations ?? []).map((item: any) => item.id);
    const progress = simulationIds.length
      ? await supabase
          .from("user_task_progress")
          .select("task_id, status, score, submitted_at, self_eval, user_simulation_id, task:tasks(title, order_index)")
          .in("user_simulation_id", simulationIds)
      : { data: [] as any[] };

    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            user: {
              id: user.id,
              email: user.email,
              preferredName,
            },
            simulations: simulations ?? [],
            progress: progress.data ?? [],
          },
          null,
          2,
        ),
      ],
      { type: "application/json;charset=utf-8" },
    );
    downloadBlob(blob, `ruhang-records-${Date.now()}.json`);
    toast.success("完成记录已导出");
  };

  const exportReport = async () => {
    if (!user) return;
    const { data: simulations } = await supabase
      .from("user_simulations")
      .select("id, simulation:simulations(title, cover_emoji, track)")
      .eq("user_id", user.id);
    const simulationIds = (simulations ?? []).map((item: any) => item.id);
    if (!simulationIds.length) {
      toast.info("还没有可导出的能力报告");
      return;
    }
    const { data: progress } = await supabase
      .from("user_task_progress")
      .select("score, status, user_simulation_id, task:tasks(title, scoring_rubric, simulation_id)")
      .in("user_simulation_id", simulationIds);
    const rows = (progress ?? []) as unknown as ReportRow[];
    const doneRows = rows.filter((row) => row.status === "done" && typeof row.score === "number");
    const average = doneRows.length
      ? Math.round(doneRows.reduce((sum, row) => sum + (row.score ?? 0), 0) / doneRows.length)
      : 0;

    const byDimension = new Map<string, { sum: number; max: number }>();
    rows.forEach((row) => {
      if (row.status !== "done") return;
      (row.task?.scoring_rubric ?? []).forEach((item) => {
        const current = byDimension.get(item.dim) ?? { sum: 0, max: 0 };
        byDimension.set(item.dim, { sum: current.sum + item.score, max: current.max + item.max });
      });
    });

    const bySimulation = new Map<string, { title: string; track: string; emoji: string; scores: number[] }>();
    (simulations ?? []).forEach((sim: any) => {
      bySimulation.set(sim.id, {
        title: sim.simulation?.title ?? "",
        track: sim.simulation?.track ?? "",
        emoji: sim.simulation?.cover_emoji ?? "💼",
        scores: [],
      });
    });
    doneRows.forEach((row) => {
      const entry = bySimulation.get(row.user_simulation_id);
      if (entry && typeof row.score === "number") entry.scores.push(row.score);
    });

    const dimHtml = Array.from(byDimension.entries())
      .map(([dim, value]) => {
        const normalized = value.max ? Math.round((value.sum / value.max) * 100) : 0;
        return `<tr><td>${dim}</td><td>${normalized}</td></tr>`;
      })
      .join("");
    const simHtml = Array.from(bySimulation.values())
      .map((sim) => {
        const avg = sim.scores.length
          ? Math.round(sim.scores.reduce((sum, item) => sum + item, 0) / sim.scores.length)
          : 0;
        return `<tr><td>${sim.emoji} ${sim.title}</td><td>${sim.track}</td><td>${avg}</td></tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>RuHang 能力报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; background: #0a1628; color: #f8fafc; padding: 32px; }
    .card { border: 1px solid rgba(201,168,76,.18); border-radius: 18px; padding: 20px; margin-bottom: 20px; background: rgba(255,255,255,.03); }
    .eyebrow { color: #c9a84c; text-transform: uppercase; letter-spacing: .18em; font-size: 12px; }
    h1,h2 { margin: 8px 0 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th,td { border-bottom: 1px solid rgba(255,255,255,.08); text-align: left; padding: 10px 8px; font-size: 14px; }
    th { color: #cbd5e1; font-weight: 600; }
    .metric { font-size: 40px; color: #c9a84c; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="eyebrow">RuHang</div>
    <h1>${preferredName} 的能力报告</h1>
    <p>导出时间：${new Date().toLocaleString("zh-CN")}</p>
    <div class="metric">${average}</div>
    <div>平均得分 / 100</div>
  </div>
  <div class="card">
    <div class="eyebrow">维度摘要</div>
    <h2>核心能力</h2>
    <table>
      <thead><tr><th>维度</th><th>归一分数</th></tr></thead>
      <tbody>${dimHtml || "<tr><td colspan='2'>暂无已完成任务数据</td></tr>"}</tbody>
    </table>
  </div>
  <div class="card">
    <div class="eyebrow">Simulation</div>
    <h2>各模拟线成绩</h2>
    <table>
      <thead><tr><th>模拟线</th><th>赛道</th><th>平均分</th></tr></thead>
      <tbody>${simHtml || "<tr><td colspan='3'>暂无模拟数据</td></tr>"}</tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `ruhang-report-${Date.now()}.html`);
    toast.success("能力报告已导出");
  };

  const resetCurrentSimulation = async () => {
    if (!resetTarget) return;
    setResettingSim(true);
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_simulation_id", resetTarget.id);
    const conversationIds = (conversations ?? []).map((item) => item.id);

    if (conversationIds.length) {
      await supabase.from("messages").delete().in("conversation_id", conversationIds);
    }
    await supabase.from("emails").delete().eq("user_simulation_id", resetTarget.id);
    await supabase.from("conversations").delete().eq("user_simulation_id", resetTarget.id);
    await supabase.from("user_task_progress").delete().eq("user_simulation_id", resetTarget.id);
    await supabase
      .from("user_simulations")
      .update({
        status: "not_started",
        progress: 0,
        offer_accepted: false,
        current_task_index: 0,
        completed_at: null,
      } as never)
      .eq("id", resetTarget.id);

    const { data } = await supabase
      .from("user_simulations")
      .select("id, status, offer_accepted, progress, completed_at, simulation:simulations(id, title, code, track, is_pro, cover_emoji)")
      .eq("user_id", user?.id ?? "");
    setRows((data ?? []) as unknown as UserSimulationRow[]);
    setResettingSim(false);
    toast.success(`已清空「${resetTarget.simulation.title}」的模拟进度`);
  };

  return (
    <div className="min-h-screen bg-gradient-navy">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-background/85 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => nav("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> 返回
          </button>
          <span className="font-display text-base font-semibold">设置</span>
          <div className="w-12" />
        </div>
        <div className="scrollbar-hidden flex gap-2 overflow-x-auto px-4 pb-3">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActive(section.key)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition",
                active === section.key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground",
              )}
            >
              <section.icon className="mr-1 inline h-3.5 w-3.5" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-12">
        <div className="mb-8 hidden md:block">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回控制台
          </Link>
          <div className="mt-3">
            <div className="eyebrow">RuHang</div>
            <h1 className="mt-2 font-display text-3xl font-semibold">设置中心</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              管理你的资料、模拟偏好、通知和订阅权益。
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="hidden md:block">
            <nav className="glass sticky top-8 space-y-1 rounded-2xl p-2">
              {SECTIONS.map((section) => {
                const selected = active === section.key;
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActive(section.key)}
                    className={cn(
                      "group relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      selected
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    {selected && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-gradient-gold" />}
                    <section.icon className={cn("mt-0.5 h-4 w-4", selected && "text-primary")} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{section.label}</div>
                      <div className="text-[10px] text-muted-foreground/80">{section.desc}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6">
            {active === "account" && (
              <SectionCard title="账户" desc="这些信息会出现在 dashboard、completion letter 和部分邮件场景里。">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="h-16 w-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold text-2xl font-display font-semibold text-primary-foreground shadow-[0_0_30px_rgba(201,168,76,0.35)]">
                      {preferredName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-display text-lg font-semibold">{preferredName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px]", isPro ? "bg-gradient-gold text-primary-foreground" : "border border-primary/30 bg-primary/5 text-primary")}>
                        {isPro ? "PRO 会员" : "免费版"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">头像上传后续开放</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-5 pt-6 md:grid-cols-2">
                  <Field label="昵称">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：李同学" />
                  </Field>
                  <Field label="展示名" hint="优先用于仪表盘和结业信">
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例如：李明 / Ming Li" />
                  </Field>
                  <Field label="中文名">
                    <Input value={chineseName} onChange={(e) => setChineseName(e.target.value)} placeholder="王怡萍" />
                  </Field>
                  <Field label="英文名">
                    <Input value={englishName} onChange={(e) => setEnglishName(e.target.value)} placeholder="Ming" />
                  </Field>
                  <Field label="邮箱" hint="登录账号，暂不支持修改">
                    <Input disabled value={user?.email ?? ""} className="opacity-60" />
                  </Field>
                  <Field label="学校" optional>
                    <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="例如：悉尼大学" />
                  </Field>
                  <Field label="专业" optional>
                    <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="金融 / 经济 / 商科" />
                  </Field>
                  <Field label="年级" optional>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                    >
                      <option value="">选择年级</option>
                      {gradeOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/5 pt-5 sm:flex-row sm:items-center">
                  <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:bg-white/5 hover:text-foreground">
                    <LogOut className="mr-2 h-4 w-4" /> 退出登录
                  </Button>
                  <Button onClick={saveAccount} disabled={savingAccount} className="bg-gradient-gold text-primary-foreground hover:opacity-95">
                    {savingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    保存账户信息
                  </Button>
                </div>
              </SectionCard>
            )}

            {active === "preferences" && (
              <SectionCard title="模拟偏好" desc="本轮会真正生效：leader 对你的称呼、反馈文案风格。其余项先保存，为后续工作台接入做准备。">
                <Field label="偏好称呼" hint="leader 和结业信会优先使用这个名字">
                  <Input
                    value={preferences.preferred_name}
                    onChange={(e) => setPreferences((current) => ({ ...current, preferred_name: e.target.value }))}
                    placeholder="例如：小李 / Ming"
                  />
                </Field>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Field label="反馈风格">
                    <select
                      value={preferences.feedback_style}
                      onChange={(e) => void savePreferences({ ...preferences, feedback_style: e.target.value as FeedbackStyle })}
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                    >
                      <option value="strict">严格直接</option>
                      <option value="balanced">平衡反馈</option>
                      <option value="encouraging">鼓励型</option>
                    </select>
                  </Field>
                  <Field label="回复节奏">
                    <select
                      value={preferences.reply_pacing}
                      onChange={(e) =>
                        void savePreferences({
                          ...preferences,
                          reply_pacing: e.target.value as ProfilePreferences["reply_pacing"],
                        })
                      }
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                    >
                      <option value="realistic">更真实</option>
                      <option value="efficient">更高效</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-6 space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <PreferenceToggle
                    label="新手提示"
                    desc="进入新场景时显示一行操作引导"
                    checked={preferences.show_beginner_hints}
                    onChange={(value) => setPreferences((current) => ({ ...current, show_beginner_hints: value }))}
                  />
                  <PreferenceToggle
                    label="Starter Kit 指引"
                    desc="首次进入任务时强调资料包入口"
                    checked={preferences.show_starter_kit_guidance}
                    onChange={(value) => setPreferences((current) => ({ ...current, show_starter_kit_guidance: value }))}
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
                  <div className="text-xs text-muted-foreground">
                    当前反馈示例：{applyFeedbackStyleTemplate(preferences.feedback_style, "我会按你设定的风格来组织反馈提示。")}
                  </div>
                  <Button
                    onClick={() => void savePreferences(preferences)}
                    disabled={savingPrefs}
                    className="bg-gradient-gold text-primary-foreground hover:opacity-95"
                  >
                    {savingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    保存模拟偏好
                  </Button>
                </div>
              </SectionCard>
            )}

            {active === "notifications" && (
              <SectionCard title="通知" desc="这轮先做读取与保存，浏览器推送暂不真正触发。">
                <div className="space-y-4">
                  <PreferenceToggle
                    label="新任务提醒"
                    desc="收到新的任务派发时提示"
                    checked={notifications.notify_new_task}
                    onChange={(value) => setNotifications((current) => ({ ...current, notify_new_task: value }))}
                  />
                  <PreferenceToggle
                    label="Leader 回复提醒"
                    desc="老板回复、追问、催进度时提示"
                    checked={notifications.notify_leader_reply}
                    onChange={(value) => setNotifications((current) => ({ ...current, notify_leader_reply: value }))}
                  />
                  <PreferenceToggle
                    label="邮件提醒"
                    desc="项目邮件和 HR 邮件到达时提示"
                    checked={notifications.notify_email}
                    onChange={(value) => setNotifications((current) => ({ ...current, notify_email: value }))}
                  />
                  <PreferenceToggle
                    label="勋章提醒"
                    desc="完成模拟、解锁勋章和生成报告时提示"
                    checked={notifications.notify_badges}
                    onChange={(value) => setNotifications((current) => ({ ...current, notify_badges: value }))}
                  />
                  <PreferenceToggle
                    label="浏览器通知"
                    desc="本轮只保留数据结构和 UI，不真正弹出浏览器推送"
                    checked={notifications.notify_browser}
                    onChange={(value) => setNotifications((current) => ({ ...current, notify_browser: value }))}
                  />
                </div>
                <div className="mt-5 flex justify-end border-t border-white/5 pt-5">
                  <Button
                    onClick={() => void saveNotifications(notifications)}
                    disabled={savingNotif}
                    className="bg-gradient-gold text-primary-foreground hover:opacity-95"
                  >
                    {savingNotif ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    保存通知设置
                  </Button>
                </div>
              </SectionCard>
            )}

            {active === "subscription" && (
              <SectionCard title="订阅与权益" desc="查看你的当前套餐、可访问赛道和已解锁模拟线。">
                <div className={cn("rounded-2xl border p-6", isPro ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/[0.02]")}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="eyebrow">当前套餐</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-display text-2xl font-semibold">{isPro ? "PRO 会员" : "免费版"}</span>
                        {isPro && <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] text-primary-foreground">全部赛道已解锁</span>}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {isPro
                          ? "你可以访问全部模拟线，并享有完整成长闭环。"
                          : "免费版可进入第一条模拟线，后续赛道需升级 PRO 解锁。"}
                      </p>
                    </div>
                    {!isPro && (
                      <Link to="/pricing" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-4 py-2 text-xs font-medium text-primary-foreground shadow-[0_0_24px_rgba(201,168,76,0.25)] hover:opacity-95">
                        <Sparkles className="h-3.5 w-3.5" />
                        升级 PRO
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {rows.map((row) => {
                    const lockedByPlan = row.simulation.is_pro && !isPro;
                    return (
                      <div key={row.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{row.simulation.cover_emoji}</div>
                            <div>
                              <div className="text-sm font-medium">{row.simulation.title}</div>
                              <div className="text-[11px] text-muted-foreground">{row.simulation.track}</div>
                            </div>
                          </div>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px]", lockedByPlan ? "border border-primary/30 bg-primary/5 text-primary" : "bg-emerald-500/15 text-emerald-200")}>
                            {lockedByPlan ? "待升级" : "已解锁"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {active === "data" && (
              <div className="space-y-6">
                <SectionCard title="数据导出" desc="把你的成长记录导出留档。">
                  <div className="space-y-3">
                    <ActionRow
                      icon={<Download className="h-4 w-4" />}
                      title="导出完成记录"
                      desc="JSON 格式，包含模拟状态、任务进度和自评数据。"
                      actionLabel="导出 JSON"
                      onClick={exportRecords}
                    />
                    <ActionRow
                      icon={<Download className="h-4 w-4" />}
                      title="导出能力报告"
                      desc="HTML 格式，适合本地保存或打印。"
                      actionLabel="导出 HTML"
                      onClick={exportReport}
                    />
                  </div>
                </SectionCard>

                <div className="overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/[0.04]">
                  <div className="flex items-start gap-3 border-b border-destructive/20 bg-destructive/[0.06] px-6 py-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                    <div>
                      <div className="font-display text-base font-semibold text-destructive">Danger Zone</div>
                      <div className="text-xs text-muted-foreground">只做最小安全版本：仅清空一条模拟线的当前进度。</div>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <Label className="mb-2 block text-xs text-muted-foreground">选择要重置的模拟线</Label>
                    <select
                      value={selectedResetId}
                      onChange={(e) => setSelectedResetId(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition focus:border-destructive/40"
                    >
                      {rows.map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.simulation.title} · {row.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-destructive/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-muted-foreground">
                      会清空该模拟线下的消息、邮件、任务进度，并回到待接受 Offer 状态。
                    </div>
                    <div className="flex gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-destructive/30 bg-destructive/[0.06] text-destructive hover:bg-destructive/10 hover:text-destructive">
                            清空当前模拟进度
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认清空当前模拟进度？</AlertDialogTitle>
                            <AlertDialogDescription>
                              {resetTarget
                                ? `这会重置「${resetTarget.simulation.title}」的任务进度、消息、邮件和对话记录。该操作不可撤销。`
                                : "该操作会清空当前模拟线的进度。"}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(event) => {
                                event.preventDefault();
                                void resetCurrentSimulation();
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {resettingSim ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              确认清空
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="outline" disabled className="border-white/10 opacity-60">
                        <Lock className="mr-2 h-3.5 w-3.5" />
                        删除账户（后续开放）
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-deep rounded-3xl border border-white/10 p-6 md:p-8">
      <div className="mb-6">
        <div className="font-display text-2xl font-semibold">{title}</div>
        <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {optional && <span className="text-[10px] normal-case tracking-normal text-muted-foreground/70">可选</span>}
      </Label>
      {children}
      {hint && <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PreferenceToggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full transition",
          checked ? "bg-primary" : "bg-white/10",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white transition",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  desc,
  actionLabel,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Button variant="outline" onClick={onClick} className="border-white/10 hover:bg-white/5">
        {actionLabel}
      </Button>
    </div>
  );
}
