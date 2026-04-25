-- ===========================================================
-- 反馈数据收集体系（借鉴 Forage 的 pre/post-survey + per-task 反馈）
-- 文件位置：db/migrations/2026-04-25_add_feedback_tables.sql
--
-- 三张表：
--   1) pre_simulation_surveys   入项问卷（接受 Offer 时必填）
--   2) task_feedback            每个 task 完成后的 emoji 反馈
--   3) post_simulation_surveys  出项问卷（项目结束时必填）
--
-- 在 Supabase / Lovable Cloud SQL editor 中按顺序执行即可。
-- ===========================================================

-- ============== 1) pre_simulation_surveys ==============
CREATE TABLE IF NOT EXISTS public.pre_simulation_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_simulation_id UUID NOT NULL REFERENCES public.user_simulations(id) ON DELETE CASCADE,
  simulation_code TEXT NOT NULL,
  -- 你怎么知道 RuHang 的？
  source TEXT NOT NULL,                         -- 'friend' | 'social' | 'school' | 'search' | 'other'
  source_other TEXT,
  -- 选这个项目的动机
  motivation TEXT NOT NULL,                     -- 'career_explore' | 'skill_build' | 'resume' | 'curious' | 'other'
  motivation_other TEXT,
  -- 1-5 分自评：你对这个赛道目前的了解程度
  prior_knowledge SMALLINT NOT NULL CHECK (prior_knowledge BETWEEN 1 AND 5),
  -- 1-5 分自评：你对完成这个项目的信心
  confidence SMALLINT NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_simulation_id)
);

ALTER TABLE public.pre_simulation_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pre_survey_owner_select" ON public.pre_simulation_surveys;
CREATE POLICY "pre_survey_owner_select" ON public.pre_simulation_surveys
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pre_survey_owner_insert" ON public.pre_simulation_surveys;
CREATE POLICY "pre_survey_owner_insert" ON public.pre_simulation_surveys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pre_survey_user ON public.pre_simulation_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_pre_survey_sim ON public.pre_simulation_surveys(simulation_code);

-- ============== 2) task_feedback ==============
CREATE TABLE IF NOT EXISTS public.task_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_simulation_id UUID NOT NULL REFERENCES public.user_simulations(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  simulation_code TEXT NOT NULL,
  task_order_index SMALLINT NOT NULL,
  -- 三档表情：bad / okay / great
  rating TEXT NOT NULL CHECK (rating IN ('bad', 'okay', 'great')),
  -- 可选文字补充
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_simulation_id, task_id)
);

ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_feedback_owner_select" ON public.task_feedback;
CREATE POLICY "task_feedback_owner_select" ON public.task_feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_feedback_owner_insert" ON public.task_feedback;
CREATE POLICY "task_feedback_owner_insert" ON public.task_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_task_feedback_user ON public.task_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_task_feedback_sim_code ON public.task_feedback(simulation_code);
CREATE INDEX IF NOT EXISTS idx_task_feedback_task ON public.task_feedback(task_id);

-- ============== 3) post_simulation_surveys ==============
CREATE TABLE IF NOT EXISTS public.post_simulation_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_simulation_id UUID NOT NULL REFERENCES public.user_simulations(id) ON DELETE CASCADE,
  simulation_code TEXT NOT NULL,
  -- 1-5 量表
  realism SMALLINT NOT NULL CHECK (realism BETWEEN 1 AND 5),                 -- 还原度
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),           -- 难度匹配
  learning_value SMALLINT NOT NULL CHECK (learning_value BETWEEN 1 AND 5),   -- 学到了多少
  feedback_quality SMALLINT NOT NULL CHECK (feedback_quality BETWEEN 1 AND 5), -- 反馈帮助
  -- 0-10 NPS
  nps SMALLINT NOT NULL CHECK (nps BETWEEN 0 AND 10),
  -- 1-5 整体星级
  overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  -- 开放题
  most_valuable TEXT,
  improvement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_simulation_id)
);

ALTER TABLE public.post_simulation_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_survey_owner_select" ON public.post_simulation_surveys;
CREATE POLICY "post_survey_owner_select" ON public.post_simulation_surveys
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_survey_owner_insert" ON public.post_simulation_surveys;
CREATE POLICY "post_survey_owner_insert" ON public.post_simulation_surveys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_post_survey_user ON public.post_simulation_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_post_survey_sim ON public.post_simulation_surveys(simulation_code);

-- ============== 完成 ==============
-- 后续可以加聚合视图，比如 每个项目的平均 NPS / 各 task 的差评率，
-- 用来做产品改进决策。这里先建表，分析层后面再加。
