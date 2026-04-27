/**
 * PostSimulationSurvey — 项目结束时的必填出项问卷。
 * 多维量表 + NPS + 整体星级 + 两道开放题。
 * 提交后才能查看证书。
 */

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitPostSimulationSurvey } from "@/lib/feedback";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

const SCALES: Array<{ key: "realism" | "difficulty" | "learningValue" | "feedbackQuality"; label: string; hint: string }> = [
  { key: "realism", label: "项目还原度", hint: "1 = 像玩具 · 5 = 像真实工作" },
  { key: "difficulty", label: "难度匹配", hint: "1 = 太难 / 太简单 · 5 = 刚好" },
  { key: "learningValue", label: "学到的东西", hint: "1 = 几乎没学到 · 5 = 学到很多" },
  { key: "feedbackQuality", label: "反馈帮助", hint: "1 = 没用 · 5 = 很有指导意义" },
];

function ScaleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-10 flex-1 rounded-lg border text-sm font-medium transition",
              value === n
                ? "border-primary bg-gradient-gold text-primary-foreground"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PostSimulationSurvey({
  open,
  userSimulationId,
  simulationCode,
  simulationTitle,
  onSubmitted,
}: {
  open: boolean;
  userSimulationId: string;
  simulationCode: string;
  simulationTitle: string;
  onSubmitted: () => void;
}) {
  const [scaleValues, setScaleValues] = useState({ realism: 0, difficulty: 0, learningValue: 0, feedbackQuality: 0 });
  const [nps, setNps] = useState<number | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [mostValuable, setMostValuable] = useState("");
  const [improvement, setImprovement] = useState("");
  const [shareWithPartner, setShareWithPartner] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    Object.values(scaleValues).every((v) => v >= 1) &&
    nps !== null &&
    overallRating >= 1 &&
    shareWithPartner !== null;

  const handleSubmit = async () => {
    if (!isValid || nps === null || shareWithPartner === null) return;
    setSubmitting(true);
    try {
      await submitPostSimulationSurvey({
        userSimulationId,
        simulationCode,
        realism: scaleValues.realism,
        difficulty: scaleValues.difficulty,
        learningValue: scaleValues.learningValue,
        feedbackQuality: scaleValues.feedbackQuality,
        nps,
        overallRating,
        mostValuable: mostValuable.trim() || null,
        improvement: improvement.trim() || null,
        shareWithPartner,
      });
      onSubmitted();
    } catch (error: any) {
      if (error?.code === "23505") {
        // 已提交过
        onSubmitted();
        return;
      }
      console.error("[PostSurvey] submit failed:", error);
      toast.error("提交失败，请重试");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="glass-strong max-h-[92vh] max-w-2xl overflow-y-auto border-white/10 [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">出项问卷 · 必填</div>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white">
              {simulationTitle} 已完成
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              在领取证书之前，请花 2 分钟告诉我们这次项目做得怎么样。你的反馈会直接驱动下一版改进。
            </p>
          </div>

          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            {SCALES.map((s) => (
              <ScaleRow
                key={s.key}
                label={s.label}
                hint={s.hint}
                value={scaleValues[s.key]}
                onChange={(v) => setScaleValues((prev) => ({ ...prev, [s.key]: v }))}
              />
            ))}
          </div>

          {/* NPS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-sm font-medium text-foreground">
              你有多大可能把 RuHang 推荐给朋友？
            </div>
            <div className="mt-1 text-xs text-muted-foreground">0 = 一定不会 · 10 = 一定会</div>
            <div className="mt-3 grid grid-cols-11 gap-1.5">
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNps(n)}
                  className={cn(
                    "h-10 rounded-lg border text-xs font-medium transition",
                    nps === n
                      ? "border-primary bg-gradient-gold text-primary-foreground"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* 五星 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-sm font-medium text-foreground">整体打分</div>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setOverallRating(n)}
                  className={cn(
                    "rounded-lg p-2 transition",
                    n <= overallRating
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary/60",
                  )}
                >
                  <Star className={cn("h-7 w-7", n <= overallRating ? "fill-primary" : "")} />
                </button>
              ))}
            </div>
          </div>

          {/* 开放题 */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">这次项目里最有价值的是什么？</label>
              <Textarea
                value={mostValuable}
                onChange={(e) => setMostValuable(e.target.value)}
                maxLength={500}
                placeholder="（选填）比如某个具体任务、Leader 的某个反馈、行业框架……"
                className="mt-2 min-h-[80px] bg-white/[0.03]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">你最希望我们改进什么？</label>
              <Textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                maxLength={500}
                placeholder="（选填）说越具体越好，比如某个任务的反馈、UI、节奏……"
                className="mt-2 min-h-[80px] bg-white/[0.03]"
              />
            </div>
          </div>

          {/* 是否公开成果给发起方/合作公司 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-sm font-medium text-foreground">
              是否愿意将本次项目结果公开给发起方 / 合作公司？
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground">愿意公开</span>：发起方或合作企业可以看到你完成本项目的情况，有机会被联系面试、收到内推或人才推荐。
              <br />
              <span className="text-foreground">保持保密</span>：仅你与 RuHang 可见，不会被任何第三方查询到。
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShareWithPartner(true)}
                className={cn(
                  "h-11 rounded-lg border text-sm font-medium transition",
                  shareWithPartner === true
                    ? "border-primary bg-gradient-gold text-primary-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40",
                )}
              >
                愿意公开
              </button>
              <button
                type="button"
                onClick={() => setShareWithPartner(false)}
                className={cn(
                  "h-11 rounded-lg border text-sm font-medium transition",
                  shareWithPartner === false
                    ? "border-primary bg-gradient-gold text-primary-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40",
                )}
              >
                保持保密
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-5">
            <div className="text-xs text-muted-foreground">
              {isValid ? "完成后即可领取证书" : "请把量表、打分和公开选项都填完"}
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="bg-gradient-gold text-primary-foreground hover:opacity-95"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {submitting ? "提交中" : "提交并领取证书"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
