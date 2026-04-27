-- ===========================================================
-- 出项问卷新增"是否公开成果给发起方/合作公司"同意字段
-- 文件位置：db/migrations/2026-04-27_add_post_survey_share_consent.sql
--
-- share_with_partner = true  -> 用户同意公开（可被发起人/合作方筛选）
-- share_with_partner = false -> 保密（默认）
-- share_consent_at           -> 用户做出同意决定的时间，便于合规追溯
-- ===========================================================

ALTER TABLE public.post_simulation_surveys
  ADD COLUMN IF NOT EXISTS share_with_partner BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_consent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_post_survey_share
  ON public.post_simulation_surveys(simulation_code, share_with_partner)
  WHERE share_with_partner = true;
