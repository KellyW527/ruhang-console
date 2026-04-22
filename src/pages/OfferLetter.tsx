import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildOfferSeed } from "@/data/seed-data";
import { getSimulationRuntime } from "@/data/workspace-runtime";
import { getPreferredDisplayName } from "@/lib/settings";

type Sim = {
  id: string;
  code: string;
  title: string;
  company: string;
  role: string;
  track: string;
  description: string;
  is_pro: boolean;
};

const OfferLetter = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [sim, setSim] = useState<Sim | null>(null);
  const [usId, setUsId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [exit, setExit] = useState(false);
  const runtime = getSimulationRuntime(sim?.code);
  const preferredName = getPreferredDisplayName(profile ?? null, user?.email);

  useEffect(() => {
    document.title = "Offer Letter · 入行 RuHang";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      const { data: s } = await supabase
        .from("simulations")
        .select("id,code,title,company,role,track,description,is_pro")
        .eq("id", id)
        .maybeSingle();
      if (s) {
        if (s.is_pro && profile?.plan !== "pro") {
          toast.info("这个模拟需要升级 Pro 后才能开始");
          nav("/pricing", { replace: true });
          return;
        }
        setSim(s);
      }
      const { data: us } = await supabase
        .from("user_simulations")
        .select("id, offer_accepted")
        .eq("user_id", user.id)
        .eq("simulation_id", id)
        .maybeSingle();
      if (us) {
        setUsId(us.id);
        if (us.offer_accepted) {
          nav(`/simulation/${id}`, { replace: true });
        }
      }
    };
    load();
  }, [user, id, nav, profile?.plan]);

  const accept = async () => {
    if (!usId || !id) return;
    setAccepting(true);

    // Mark accepted
    await supabase.from("user_simulations").update({ offer_accepted: true, status: "in_progress" }).eq("id", usId);

    // Seed conversations + first messages + first task + initial email — only once
    const { data: existing } = await supabase.from("conversations").select("id").eq("user_simulation_id", usId).limit(1);
    if (!existing || existing.length === 0) {
      // First task
      const { data: firstTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("simulation_id", id)
        .eq("order_index", 0)
        .maybeSingle();

      const seed = buildOfferSeed({
        simulationCode: sim?.code ?? "",
        company: sim?.company ?? "项目团队",
        userEmail: user?.email ?? "",
        userName: preferredName,
        firstTask: firstTask
          ? {
              orderIndex: firstTask.order_index,
              id: firstTask.id,
              title: firstTask.title,
              assignmentMessage: firstTask.assignment_message,
            }
          : null,
      });

      const { data: convs } = await supabase
        .from("conversations")
        .insert(seed.conversations.map((conversation) => ({
          ...conversation,
          user_simulation_id: usId,
        })))
        .select();
      const bossConv = convs?.find((c) => c.name === seed.conversationNames.boss);
      const groupConv = convs?.find((c) => c.name === seed.conversationNames.group);
      const hrConv = convs?.find((c) => c.name === seed.conversationNames.hr);

      // Mark first task active
      if (firstTask) {
        await supabase.from("user_task_progress").insert({
          user_simulation_id: usId,
          task_id: firstTask.id,
          status: "active",
        });
      }

      const messages = [];
      if (bossConv) {
        messages.push(
          ...seed.introMessages.boss.map((message) => ({
            ...message,
            conversation_id: bossConv.id,
          })),
        );
      }
      if (groupConv) {
        messages.push(
          ...seed.introMessages.group.map((message) => ({
            ...message,
            conversation_id: groupConv.id,
          })),
        );
      }
      if (hrConv) {
        messages.push(
          ...seed.introMessages.hr.map((message) => ({
            ...message,
            conversation_id: hrConv.id,
          })),
        );
      }
      if (messages.length) await supabase.from("messages").insert(messages);

      // Seed sample emails
      await supabase.from("emails").insert(
        seed.initialEmails.map((email) => ({
          ...email,
          user_simulation_id: usId,
        })),
      );
    }

    setExit(true);
    setTimeout(() => nav(`/simulation/${id}`), 600);
  };

  if (!sim) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 halo-gold opacity-60 pointer-events-none" />
      <div className="absolute inset-0 halo-blue opacity-40 pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-2xl" />

      <Link to="/dashboard" className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-gold font-display text-xs font-bold text-primary-foreground">
          入
        </span>
        返回控制台
      </Link>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <AnimatePresence>
          {!exit && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl"
            >
              <div className="h-1.5 w-full bg-gradient-gold" />
              <div className="px-6 py-8 sm:px-10 sm:py-12 md:px-14">
                <div className="flex items-start justify-between border-b border-slate-200 pb-5 sm:pb-6">
                  <div>
                    <div className="font-display text-base font-bold text-slate-900 sm:text-xl">{sim.company}</div>
                    <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">HUARUI SECURITIES</div>
                  </div>
                  <div className="text-right text-[9px] uppercase tracking-widest text-slate-400 sm:text-[10px]">OFFER LETTER</div>
                </div>

                <h1 className="mt-6 font-display text-2xl font-bold text-slate-900 sm:mt-8 sm:text-3xl">录用通知书</h1>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {new Date().getFullYear()} 年 {new Date().getMonth() + 1} 月 {new Date().getDate()} 日
                </p>

                <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-700 sm:mt-8 sm:space-y-4">
                  <p>{preferredName ?? "同学"} 同学：</p>
                  <p>
                    您好。经过严格的简历筛选与多轮面试评估，我们非常高兴地通知您，您已被
                    <strong className="font-semibold text-slate-900">{sim.company}</strong>
                    录用为<strong className="font-semibold text-slate-900">{sim.role}</strong>
                    ，加入<strong className="font-semibold text-slate-900">{sim.title.split("·").slice(-1)[0]?.trim()}</strong>。
                  </p>
                  <p>{sim.description}</p>
                  <p>
                    您的直属上级为{runtime.leader.name}（{runtime.leader.title}），他将在工作中与您紧密协作，并为您安排第一阶段的项目任务。请您做好准备，迎接职业生涯的第一个真实项目。
                  </p>
                  <p className="pt-1 sm:pt-2">期待与您并肩工作。</p>
                </div>

                <div className="mt-8 flex items-end justify-between sm:mt-12">
                  <div>
                    <div className="font-display text-sm font-medium italic text-slate-800 sm:text-base">{sim.company}</div>
                    <div className="mt-1 text-[11px] text-slate-500 sm:text-xs">人力资源部</div>
                  </div>
                  <div className="rounded-full border-2 border-rose-500/70 px-3 py-1.5 font-display text-[10px] text-rose-500/80 -rotate-12 sm:px-4 sm:py-2 sm:text-xs">
                    {sim.company.slice(0, 2)} HR
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-5 sm:mt-10 sm:pt-6">
                  <Button
                    onClick={accept}
                    disabled={accepting}
                    className="h-12 w-full bg-gradient-gold text-base text-primary-foreground shadow-glow-gold hover:opacity-95"
                  >
                    {accepting ? "正在为您安排工位..." : "接受 Offer，开始工作 →"}
                  </Button>
                  <button
                    onClick={() => toast.info("我们会想念你的 👋") }
                    className="mt-3 block w-full text-center text-xs text-slate-400 hover:text-slate-600"
                  >
                    稍后再决定
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OfferLetter;
