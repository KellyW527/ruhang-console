/**
 * Feedback persistence helpers.
 * 把 pre/post survey + per-task 反馈写入 Supabase。
 * 三张表：pre_simulation_surveys / task_feedback / post_simulation_surveys
 *
 * 设计原则：
 * - 调用方只需要传业务字段，user_id 自动从 auth 拿
 * - 失败抛错，前端自己 toast，避免静默丢数据
 */

import { supabase } from "@/integrations/supabase/client";

export type PreSurveySource = "friend" | "social" | "school" | "search" | "other";
export type PreSurveyMotivation =
  | "career_explore"
  | "skill_build"
  | "resume"
  | "curious"
  | "other";

export type PreSurveyPayload = {
  userSimulationId: string;
  simulationCode: string;
  source: PreSurveySource;
  sourceOther?: string | null;
  motivation: PreSurveyMotivation;
  motivationOther?: string | null;
  priorKnowledge: number; // 1-5
  confidence: number; // 1-5
};

export type TaskRating = "bad" | "okay" | "great";

export type TaskFeedbackPayload = {
  userSimulationId: string;
  taskId: string;
  simulationCode: string;
  taskOrderIndex: number;
  rating: TaskRating;
  comment?: string | null;
};

export type PostSurveyPayload = {
  userSimulationId: string;
  simulationCode: string;
  realism: number; // 1-5
  difficulty: number; // 1-5
  learningValue: number; // 1-5
  feedbackQuality: number; // 1-5
  nps: number; // 0-10
  overallRating: number; // 1-5
  mostValuable?: string | null;
  improvement?: string | null;
  shareWithPartner: boolean; // 是否同意把项目结果公开给发起人/合作公司
};

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("未登录");
  return data.user.id;
}

export async function getPreSimulationSurvey(userSimulationId: string) {
  const { data, error } = await supabase
    .from("pre_simulation_surveys")
    .select("id")
    .eq("user_simulation_id", userSimulationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitPreSimulationSurvey(payload: PreSurveyPayload) {
  const userId = await getUserId();
  const { error } = await supabase.from("pre_simulation_surveys").insert({
    user_id: userId,
    user_simulation_id: payload.userSimulationId,
    simulation_code: payload.simulationCode,
    source: payload.source,
    source_other: payload.sourceOther ?? null,
    motivation: payload.motivation,
    motivation_other: payload.motivationOther ?? null,
    prior_knowledge: payload.priorKnowledge,
    confidence: payload.confidence,
  });
  if (error) throw error;
}

export async function submitTaskFeedback(payload: TaskFeedbackPayload) {
  const userId = await getUserId();
  const { error } = await supabase.from("task_feedback").insert({
    user_id: userId,
    user_simulation_id: payload.userSimulationId,
    task_id: payload.taskId,
    simulation_code: payload.simulationCode,
    task_order_index: payload.taskOrderIndex,
    rating: payload.rating,
    comment: payload.comment ?? null,
  });
  if (error) throw error;
}

export async function getPostSimulationSurvey(userSimulationId: string) {
  const { data, error } = await supabase
    .from("post_simulation_surveys")
    .select("id")
    .eq("user_simulation_id", userSimulationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitPostSimulationSurvey(payload: PostSurveyPayload) {
  const userId = await getUserId();
  const { error } = await supabase.from("post_simulation_surveys").insert({
    user_id: userId,
    user_simulation_id: payload.userSimulationId,
    simulation_code: payload.simulationCode,
    realism: payload.realism,
    difficulty: payload.difficulty,
    learning_value: payload.learningValue,
    feedback_quality: payload.feedbackQuality,
    nps: payload.nps,
    overall_rating: payload.overallRating,
    most_valuable: payload.mostValuable ?? null,
    improvement: payload.improvement ?? null,
  });
  if (error) throw error;
}
