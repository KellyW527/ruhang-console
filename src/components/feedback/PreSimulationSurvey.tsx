/**
 * PreSimulationSurvey — 接受 Offer 后必填的入项问卷。
 * 借鉴 Forage 的 onboarding survey：来源 / 动机 / 自评起点。
 * 必填、不可跳过；提交后才允许进入 Workspace。
 */

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  submitPreSimulationSurvey,
  type PreSurveyMotivation,
  type PreSurveySource,
} from "@/lib/feedback";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SOURCES: { value: PreSurveySource; label: string }[] = [
  { value: "friend", label: "朋友 / 同学推荐" },
  { value: "social", label: "小红书 / 微博 / 抖音" },
  { value: "school", label: "学校 / 老师" },
  { value: "search", label: "搜索引擎" },
  { value: "other", label: "其他" },
];

const MOTIVATIONS: { value: PreSurveyMotivation; label: string; desc: string }[] = [
  { value: "career_explore", label: "探索职业方向", desc: "想看看这个赛道到底在做什么" },
  { value: "skill_build", label: "建立专业技能", desc: "想学会真实工作里要用的硬技能" },
  { value: "resume", label: "丰富简历经历", desc: "为申请实习 / 求职做准备" },
  { value: "curious", label: "纯粹好奇", desc: "想体验一下，没有明确目标" },
  { value: "other", label: "其他", desc: "" },
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
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-11 flex-1 rounded-xl border text-sm font-medium transition",
              value === n
                ? "border-primary bg-gradient-gold text-primary-foreground shadow-glow-gold"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PreSimulationSurvey({
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
  const [source, setSource] = useState<PreSurveySource | null>(null);
  const [sourceOther, setSourceOther] = useState("");
  const [motivation, setMotivation] = useState<PreSurveyMotivation | null>(null);
  const [motivationOther, setMotivationOther] = useState("");
  const [priorKnowledge, setPriorKnowledge] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    !!source &&
    (source !== "other" || sourceOther.trim().length > 0) &&
    !!motivation &&
    (motivation !== "other" || motivationOther.trim().length > 0) &&
    priorKnowledge >= 1 &&
    confidence >= 1;

  const handleSubmit = async () => {
    if (!isValid || !source || !motivation) return;
    setSubmitting(true);
    try {
      await submitPreSimulationSurvey({
        userSimulationId,
        simulationCode,
        source,
        sourceOther: source === "other" ? sourceOther.trim() : null,
        motivation,
        motivationOther: motivation === "other" ? motivationOther.trim() : null,
        priorKnowledge,
        confidence,
      });
      onSubmitted();
    } catch (error) {
      console.error("[PreSurvey] submit failed:", error);
      toast.error("提交失败，请重试");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="glass-strong max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">入项问卷 · 必填</div>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white">
              开始 {simulationTitle} 之前
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              花 1 分钟告诉我们你的起点。这些信息只我们看，不会出现在你的成绩单里，但会直接帮我们把项目做得更对你的胃口。
            </p>
          </div>

          {/* 来源 */}
          <div>
            <div className="text-sm font-medium text-foreground">你怎么知道 RuHang 的？</div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SOURCES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSource(opt.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm transition",
                    source === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {source === "other" && (
              <Textarea
                placeholder="说说看？"
                value={sourceOther}
                onChange={(e) => setSourceOther(e.target.value)}
                maxLength={200}
                className="mt-3 min-h-[60px] bg-white/[0.03]"
              />
            )}
          </div>

          {/* 动机 */}
          <div>
            <div className="text-sm font-medium text-foreground">选这个项目，主要是为了</div>
            <div className="mt-3 space-y-2">
              {MOTIVATIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMotivation(opt.value)}
                  className={cn(
                    "block w-full rounded-xl border px-4 py-3 text-left transition",
                    motivation === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/[0.03] hover:border-primary/40",
                  )}
                >
                  <div className="text-sm font-medium text-foreground">{opt.label}</div>
                  {opt.desc && (
                    <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
                  )}
                </button>
              ))}
            </div>
            {motivation === "other" && (
              <Textarea
                placeholder="说说看？"
                value={motivationOther}
                onChange={(e) => setMotivationOther(e.target.value)}
                maxLength={200}
                className="mt-3 min-h-[60px] bg-white/[0.03]"
              />
            )}
          </div>

          {/* 自评 */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <ScaleRow
              label="你对这个赛道目前了解多少？"
              hint="1 = 完全不懂 · 5 = 已经很熟"
              value={priorKnowledge}
              onChange={setPriorKnowledge}
            />
            <ScaleRow
              label="你对完成这个项目的信心？"
              hint="1 = 没什么把握 · 5 = 很有信心"
              value={confidence}
              onChange={setConfidence}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-5">
            <div className="text-xs text-muted-foreground">
              {isValid ? "可以开始了" : "请把上面的题目都填完"}
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="bg-gradient-gold text-primary-foreground hover:opacity-95"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {submitting ? "提交中" : "进入工作台"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
