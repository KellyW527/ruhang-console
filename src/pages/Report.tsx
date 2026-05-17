import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, Award, TrendingUp, Target, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getPreferredDisplayName } from "@/lib/settings";

type RubricItem = { dim: string; score: number; max: number };

type Row = {
  task_id: string;
  score: number | null;
  status: string;
  user_simulation_id: string;
  task: {
    title: string;
    scoring_rubric: RubricItem[];
    simulation_id: string;
  };
};

type SimAgg = {
  simulation_id: string;
  title: string;
  cover_emoji: string;
  track: string;
  done: number;
  total: number;
  avgScore: number;
};

type DimAgg = {
  dim: string;
  value: number;
  n: number;
  note: string;
};

const Report = () => {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [sims, setSims] = useState<SimAgg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "能力报告 · 入行";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      // All user_simulations + simulation meta
      const { data: us } = await supabase
        .from("user_simulations")
        .select("id, simulation:simulations(id, title, cover_emoji, track)")
        .eq("user_id", user.id);

      const usIds = (us ?? []).map((u: any) => u.id);
      if (usIds.length === 0) {
        setLoading(false);
        return;
      }

      // All progress for those user_simulations
      const { data: progress } = await supabase
        .from("user_task_progress")
        .select("task_id, score, status, user_simulation_id, task:tasks(title, scoring_rubric, simulation_id)")
        .in("user_simulation_id", usIds);

      const ps = (progress ?? []) as any as Row[];
      setRows(ps);

      // Per simulation aggregation
      const byUs: Record<string, { sim: any; rows: Row[] }> = {};
      (us ?? []).forEach((u: any) => {
        byUs[u.id] = { sim: u.simulation, rows: [] };
      });
      ps.forEach((r) => {
        if (byUs[r.user_simulation_id]) byUs[r.user_simulation_id].rows.push(r);
      });

      // tasks count per simulation
      const simIds = Array.from(new Set((us ?? []).map((u: any) => u.simulation?.id).filter(Boolean)));
      const totals: Record<string, number> = {};
      await Promise.all(
        simIds.map(async (sid) => {
          const { count } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("simulation_id", sid as string);
          totals[sid as string] = count ?? 0;
        }),
      );

      const aggs: SimAgg[] = Object.values(byUs).map(({ sim, rows: rs }) => {
        const done = rs.filter((r) => r.status === "done").length;
        const scored = rs.filter((r) => typeof r.score === "number");
        const avg = scored.length
          ? Math.round(scored.reduce((a, b) => a + (b.score ?? 0), 0) / scored.length)
          : 0;
        return {
          simulation_id: sim?.id ?? "",
          title: sim?.title ?? "",
          cover_emoji: sim?.cover_emoji ?? "💼",
          track: sim?.track ?? "",
          done,
          total: totals[sim?.id] ?? 0,
          avgScore: avg,
        };
      });
      setSims(aggs);
      setLoading(false);
    };
    load();
  }, [user]);

  // Aggregate radar dims across all completed tasks
  const radarData = useMemo<DimAgg[]>(() => {
    const acc: Record<string, { sum: number; maxSum: number; n: number }> = {};
    rows.forEach((r) => {
      if (r.status !== "done") return;
      const rubric = (r.task?.scoring_rubric ?? []) as RubricItem[];
      rubric.forEach((d) => {
        if (!acc[d.dim]) acc[d.dim] = { sum: 0, maxSum: 0, n: 0 };
        acc[d.dim].sum += d.score;
        acc[d.dim].maxSum += d.max;
        acc[d.dim].n += 1;
      });
    });
    return Object.entries(acc).map(([dim, v]) => ({
      dim,
      value: v.maxSum ? Math.round((v.sum / v.maxSum) * 100) : 0,
      n: v.n,
      note:
        v.maxSum && v.sum / v.maxSum >= 0.85
          ? "这个维度已经比较稳了，可以继续拉高标准。"
          : v.maxSum && v.sum / v.maxSum >= 0.7
            ? "基础完成度不错，下一步更适合练判断和表达。"
            : "这个维度还需要更多刻意练习，建议回看具体任务反馈。",
    }));
  }, [rows]);

  const totalDone = rows.filter((r) => r.status === "done").length;
  const overallAvg = useMemo(() => {
    const scored = rows.filter((r) => r.status === "done" && typeof r.score === "number");
    if (!scored.length) return 0;
    return Math.round(scored.reduce((a, b) => a + (b.score ?? 0), 0) / scored.length);
  }, [rows]);

  const topDim = useMemo(() => {
    if (!radarData.length) return null;
    return [...radarData].sort((a, b) => b.value - a.value)[0];
  }, [radarData]);
  const weakDim = useMemo(() => {
    if (!radarData.length) return null;
    return [...radarData].sort((a, b) => a.value - b.value)[0];
  }, [radarData]);

  const name = getPreferredDisplayName(profile ?? null, user?.email) ?? "新同学";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const empty = totalDone === 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-widest text-primary">能力档案</div>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            {name} 的能力雷达
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            根据你已完成的所有任务汇总，每个维度按"得分 / 满分"归一到 100。
          </p>
        </div>

        {empty ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="font-display text-xl font-semibold">还没有可分析的数据</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              先完成至少一个任务，能力雷达会立刻在这里成形。
            </p>
            <Button onClick={() => nav("/dashboard")} className="mt-6 bg-gradient-gold text-primary-foreground hover:opacity-95">
              去控制台开始
            </Button>
          </div>
        ) : (
          <>
            {/* Stat row */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Award className="h-5 w-5" />}
                label="平均得分"
                value={`${overallAvg}`}
                suffix="/ 100"
                accent
              />
              <StatCard
                icon={<Target className="h-5 w-5" />}
                label="已完成任务"
                value={`${totalDone}`}
                suffix="个"
              />
              <StatCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="覆盖维度"
                value={`${radarData.length}`}
                suffix="项"
              />
              <StatCard
                icon={<Sparkles className="h-5 w-5" />}
                label="完成模拟"
                value={`${sims.filter((s) => s.done === s.total && s.total > 0).length}`}
                suffix="条"
              />
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
              {/* Radar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass relative overflow-hidden rounded-2xl p-6 md:p-8"
              >
                <div className="halo-gold pointer-events-none absolute inset-0 opacity-50" />
                <h3 className="font-display text-lg font-semibold">能力雷达</h3>
                <p className="text-xs text-muted-foreground">维度归一化分数（百分制）</p>
                <div className="mt-6 h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="dim"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        stroke="hsl(var(--border))"
                      />
                      <Radar
                        name="得分"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {topDim && weakDim && topDim.dim !== weakDim.dim && (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-emerald-300/80">最强项</div>
                      <div className="mt-0.5 font-medium text-foreground">
                        {topDim.dim} <span className="font-mono text-emerald-300">{topDim.value}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-amber-300/80">待提升</div>
                      <div className="mt-0.5 font-medium text-foreground">
                        {weakDim.dim} <span className="font-mono text-amber-300">{weakDim.value}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Dim cards */}
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold">维度明细</h3>
                <div className="space-y-3">
                  {radarData
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3)
                    .map((d) => (
                      <motion.div
                        key={d.dim}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-xl p-4"
                      >
                        <div className="flex items-baseline justify-between">
                          <div className="text-sm font-medium">{d.dim}</div>
                          <div className="font-mono text-sm text-primary">
                            {d.value}
                            <span className="ml-0.5 text-[10px] text-muted-foreground">/ 100</span>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${d.value}%` }} />
                        </div>
                        <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{d.note}</div>
                      </motion.div>
                    ))}
                </div>
                {radarData.length > 3 && (
                  <Accordion type="single" collapsible className="glass rounded-2xl px-4">
                    <AccordionItem value="all-dims" className="border-white/5">
                      <AccordionTrigger className="text-sm hover:text-primary hover:no-underline">
                        查看全部维度
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        {radarData
                          .slice()
                          .sort((a, b) => b.value - a.value)
                          .slice(3)
                          .map((d) => (
                            <div key={d.dim} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                              <div className="flex items-baseline justify-between">
                                <div className="text-sm font-medium">{d.dim}</div>
                                <div className="font-mono text-sm text-primary">{d.value}</div>
                              </div>
                              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${d.value}%` }} />
                              </div>
                              <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{d.note}</div>
                            </div>
                          ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>

            {/* Per simulation breakdown */}
            <div className="mt-12">
              <h3 className="mb-4 font-display text-lg font-semibold">按模拟分组的成绩单</h3>
              <div className="space-y-4">
                {sims.map((s) => {
                  const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
                  return (
                    <div key={s.simulation_id} className="glass rounded-2xl p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{s.cover_emoji}</div>
                          <div>
                            <h4 className="text-sm font-medium leading-snug">{s.title}</h4>
                            <div className="mt-1 inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                              {s.track}
                            </div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="justify-start md:justify-center">
                          查看回顾
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-3 text-xs md:grid-cols-3">
                        <div>
                          <div className="text-muted-foreground">完成度</div>
                          <div className="mt-0.5 font-mono text-base text-foreground">
                            {s.done}
                            <span className="text-xs text-muted-foreground"> / {s.total}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">平均分</div>
                          <div className="mt-0.5 font-mono text-base text-primary">
                            {s.avgScore || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">状态</div>
                          <div className="mt-0.5 text-sm text-foreground">{pct === 100 ? "已完成" : "进行中"}</div>
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-gold transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function StatCard({
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
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={accent ? "text-primary" : ""}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`font-display text-3xl font-semibold ${accent ? "text-primary" : ""}`}>
          {value}
        </span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export default Report;
