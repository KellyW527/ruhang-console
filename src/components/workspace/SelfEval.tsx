import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, PencilLine } from "lucide-react";

export type SelfEvalValue = {
  scores: Record<string, number>;
  reflection: string;
  submitted_at: string;
};

export function SelfEval({
  dimensions,
  initial,
  taskId,
  userSimulationId,
  onSaved,
  readOnly = false,
}: {
  dimensions: { dim: string; max: number }[];
  initial?: SelfEvalValue | null;
  taskId: string;
  userSimulationId: string;
  onSaved?: (v: SelfEvalValue) => void;
  readOnly?: boolean;
}) {
  const [scores, setScores] = useState<Record<string, number>>(
    () => initial?.scores ?? Object.fromEntries(dimensions.map((d) => [d.dim, Math.round(d.max * 0.7)])),
  );
  const [reflection, setReflection] = useState(initial?.reflection ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initial?.submitted_at ?? null);
  const [locked, setLocked] = useState(Boolean(initial?.submitted_at));

  const total = dimensions.reduce((s, d) => s + (scores[d.dim] ?? 0), 0);
  const max = dimensions.reduce((s, d) => s + d.max, 0);

  const save = async () => {
    if (readOnly) return;
    if (!reflection.trim()) {
      toast.error("请写下你的反思（哪怕只有一句话）");
      return;
    }
    setSaving(true);
    const value: SelfEvalValue = { scores, reflection: reflection.trim(), submitted_at: new Date().toISOString() };
    const { error } = await supabase
      .from("user_task_progress")
      .update({ self_eval: value as any })
      .eq("user_simulation_id", userSimulationId)
      .eq("task_id", taskId);
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("保存失败");
      return;
    }
    setSavedAt(value.submitted_at);
    setLocked(true);
    toast.success("自我评估已保存 ✨");
    onSaved?.(value);
  };

  return (
    <div className="space-y-5 py-2">
      {savedAt && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>已保存</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(savedAt).toLocaleString("zh-CN")}
              </div>
            </div>
            <div className="font-mono text-lg text-primary">
              {total} <span className="text-xs text-muted-foreground">/ {max}</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">你给自己打的总分</span>
          <span className="font-mono text-lg text-primary">
            {total} <span className="text-xs text-muted-foreground">/ {max}</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {dimensions.map((d) => {
          const v = scores[d.dim] ?? 0;
          return (
            <div key={d.dim}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium">{d.dim}</span>
                <span className="font-mono text-primary">
                  {v} <span className="text-muted-foreground">/ {d.max}</span>
                </span>
              </div>
              <Slider
                value={[v]}
                min={0}
                max={d.max}
                step={1}
                disabled={locked || readOnly}
                onValueChange={(arr) => setScores((s) => ({ ...s, [d.dim]: arr[0] }))}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">一句话反思 / 下次想改进什么</label>
        <Textarea
          value={reflection}
          disabled={locked || readOnly}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="比如：估值假设不够保守，下次先做敏感性分析…"
          className="min-h-[100px] resize-y bg-background/50 text-sm"
        />
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-muted-foreground">
          {savedAt ? `上次保存于 ${new Date(savedAt).toLocaleString("zh-CN")}` : "尚未保存"}
        </span>
        <div className="flex items-center gap-2">
          {locked && !readOnly && (
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => setLocked(false)}
            >
              <PencilLine className="mr-1.5 h-3.5 w-3.5" />
              重新编辑
            </Button>
          )}
          <Button
            size="sm"
            onClick={save}
            disabled={saving || locked || readOnly}
            className="bg-gradient-gold text-primary-foreground hover:opacity-95"
          >
            {readOnly ? "已保存" : saving ? "保存中…" : savedAt ? "更新评估" : "保存评估"}
          </Button>
        </div>
      </div>
    </div>
  );
}
