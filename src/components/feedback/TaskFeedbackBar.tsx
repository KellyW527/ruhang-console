/**
 * TaskFeedbackBar — 任务通过后的三表情快速反馈。
 * 借鉴 Forage 的 "How was this task?"。
 * 写入 task_feedback 表，每个 (user_simulation, task) 只能交一次。
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitTaskFeedback, type TaskRating } from "@/lib/feedback";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

const OPTIONS: { value: TaskRating; emoji: string; label: string }[] = [
  { value: "bad", emoji: "😕", label: "不太好" },
  { value: "okay", emoji: "🙂", label: "还可以" },
  { value: "great", emoji: "🤩", label: "很棒" },
];

export function TaskFeedbackBar({
  userSimulationId,
  taskId,
  simulationCode,
  taskOrderIndex,
  onSubmitted,
}: {
  userSimulationId: string;
  taskId: string;
  simulationCode: string;
  taskOrderIndex: number;
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState<TaskRating | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (chosen: TaskRating, finalComment: string) => {
    setSubmitting(true);
    try {
      await submitTaskFeedback({
        userSimulationId,
        taskId,
        simulationCode,
        taskOrderIndex,
        rating: chosen,
        comment: finalComment.trim() || null,
      });
      setDone(true);
      onSubmitted?.();
    } catch (error: any) {
      // 23505 = 唯一冲突，意味着已经交过了，按成功处理
      if (error?.code === "23505") {
        setDone(true);
        return;
      }
      console.error("[TaskFeedback] submit failed:", error);
      toast.error("提交失败，可以稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
        <Check className="h-4 w-4" />
        反馈已收到，谢谢你帮我们改进「入行」。
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-medium text-foreground">这个任务你的体验如何？</div>
      <div className="mt-1 text-xs text-muted-foreground">
        匿名收集，用来改进任务难度和反馈质量。
      </div>
      <div className="mt-3 flex gap-2">
        {OPTIONS.map((opt) => {
          const active = rating === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={submitting}
              onClick={() => {
                setRating(opt.value);
                // bad 和 okay 引导用户写一句话；great 直接提交
                if (opt.value === "great") {
                  void handleSubmit(opt.value, comment);
                }
              }}
              className={cn(
                "flex-1 rounded-xl border px-3 py-3 text-center transition",
                active
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-primary/40",
              )}
            >
              <div className="text-2xl">{opt.emoji}</div>
              <div className="mt-1 text-xs text-muted-foreground">{opt.label}</div>
            </button>
          );
        })}
      </div>
      {rating && rating !== "great" && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="可以告诉我们具体哪里可以更好吗？（选填）"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="min-h-[70px] bg-white/[0.03] text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSubmit(rating, comment)}
              disabled={submitting}
              className="bg-gradient-gold text-primary-foreground hover:opacity-95"
            >
              {submitting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              提交反馈
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
