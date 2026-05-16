import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { supabase } from "@/integrations/supabase/client";
import { getTaskReferenceContent } from "@/data/workspace-runtime";

type TaskRow = {
  id: string;
  order_index: number;
  title: string;
  standard_answer: string;
  simulation_id: string;
};

type SimulationRow = {
  id: string;
  code: string | null;
  title: string;
};

export default function TaskAnswer() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const [task, setTask] = useState<TaskRow | null>(null);
  const [simulation, setSimulation] = useState<SimulationRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "完整标准答案 · 入行";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!id || !taskId) return;
      setLoading(true);

      const [{ data: sim }, { data: taskRow }] = await Promise.all([
        supabase
          .from("simulations")
          .select("id, code, title")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("tasks")
          .select("id, order_index, title, standard_answer, simulation_id")
          .eq("id", taskId)
          .eq("simulation_id", id)
          .maybeSingle(),
      ]);

      setSimulation((sim as SimulationRow | null) ?? null);
      setTask((taskRow as TaskRow | null) ?? null);
      setLoading(false);
    };

    void load();
  }, [id, taskId]);

  const answer = useMemo(() => {
    if (!task) return "";
    const reference = getTaskReferenceContent(simulation?.code, task.order_index);
    return reference?.standardAnswer ?? task.standard_answer ?? "";
  }, [simulation?.code, task]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-muted-foreground">
          正在加载完整答案…
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to={id ? `/simulation/${id}` : "/dashboard"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回工作台
            </Link>
          </Button>
          <div className="text-lg font-medium">没有找到这道任务的标准答案。</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-6">
      <main className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <FileText className="h-3.5 w-3.5" />
                完整标准答案
              </div>
              <h1 className="font-display text-2xl font-semibold text-white md:text-3xl">
                {task.title}
              </h1>
              {simulation && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {simulation.title} · Task {task.order_index + 1}
                </p>
              )}
            </div>
            <Button asChild variant="ghost" className="shrink-0 rounded-full border border-white/10 bg-white/[0.03]">
              <Link to={`/simulation/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回工作台
              </Link>
            </Button>
          </div>
        </header>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 md:p-8">
          <MarkdownContent content={answer} />
        </section>
      </main>
    </div>
  );
}
