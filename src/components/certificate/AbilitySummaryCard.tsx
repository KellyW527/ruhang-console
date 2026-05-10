/**
 * AbilitySummaryCard
 * ----------------------------------------------------------------
 * 调 ai-summary 边缘函数生成 / 拉取学员能力画像，渲染在证书下方。
 * 第一次进来若无缓存会触发生成（loading 态），生成后写入数据库下次秒开。
 */
import { useEffect, useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase, supabasePublicConfig } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SummaryPayload = {
  headline?: string;
  strengths?: string[];
  improvements?: string[];
  skill_scores?: { dim: string; score: number }[];
  summary_paragraph?: string;
};

type Props = {
  userSimulationId: string;
  simulationTitle: string;
};

export function AbilitySummaryCard({ userSimulationId, simulationTitle }: Props) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SummaryPayload | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const callGenerate = async (force = false) => {
    if (!supabasePublicConfig.ok || !supabasePublicConfig.url) {
      throw new Error("配置缺失");
    }
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) throw new Error("登录已失效");
    const resp = await fetch(`${supabasePublicConfig.url}/functions/v1/ai-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_simulation_id: userSimulationId, force }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.error ?? "生成失败");
    return data;
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 先尝试读缓存
        const { data: cached } = await supabase
          .from("simulation_ai_summaries" as any)
          .select("payload, created_at")
          .eq("user_simulation_id", userSimulationId)
          .maybeSingle();
        if (cancelled) return;
        if (cached) {
          setPayload(cached.payload as SummaryPayload);
          setGeneratedAt((cached as any).created_at ?? null);
          setLoading(false);
          return;
        }
        // 没缓存就触发一次
        setGenerating(true);
        const result = await callGenerate(false);
        if (cancelled) return;
        setPayload(result.payload as SummaryPayload);
        setGeneratedAt(new Date().toISOString());
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message ?? "加载失败");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setGenerating(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userSimulationId]);

  const handleRegenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await callGenerate(true);
      setPayload(result.payload as SummaryPayload);
      setGeneratedAt(new Date().toISOString());
      toast.success("能力画像已重新生成");
    } catch (err: any) {
      setError(err?.message ?? "生成失败");
      toast.error(err?.message ?? "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI 能力画像</h3>
            <p className="text-xs text-muted-foreground">
              基于你在《{simulationTitle}》中的所有任务、自评和提交，由 AI 总结生成
            </p>
          </div>
        </div>
        {payload && !loading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            重新生成
          </Button>
        )}
      </div>

      {(loading || generating) && (
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {generating ? "AI 正在分析你的全部表现，约需 10-30 秒…" : "加载中…"}
        </div>
      )}

      {error && !loading && !generating && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-2 h-7 px-2 text-xs"
            onClick={handleRegenerate}
          >
            重试
          </Button>
        </div>
      )}

      {payload && !loading && !generating && (
        <div className="mt-6 space-y-6">
          {payload.headline && (
            <div className="text-2xl font-semibold leading-snug text-foreground">
              「{payload.headline}」
            </div>
          )}

          {payload.summary_paragraph && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {payload.summary_paragraph}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {payload.strengths && payload.strengths.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  核心优势
                </div>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {payload.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {payload.improvements && payload.improvements.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  待提升
                </div>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {payload.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {payload.skill_scores && payload.skill_scores.length > 0 && (
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                能力维度
              </div>
              <div className="space-y-2">
                {payload.skill_scores.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{s.dim}</span>
                      <span className="font-mono text-muted-foreground">{s.score}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-gold"
                        style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedAt && (
            <div className="text-[11px] text-muted-foreground">
              生成于 {new Date(generatedAt).toLocaleString("zh-CN")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
