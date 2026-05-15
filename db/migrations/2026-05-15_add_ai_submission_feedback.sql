-- Store AI-generated per-task submission feedback.
-- Apply before deploying the evaluate-submission function / updated Workspace UI.

alter table public.user_task_progress
  add column if not exists submitted_file_path text,
  add column if not exists ai_feedback jsonb,
  add column if not exists ai_feedback_model text,
  add column if not exists ai_feedback_created_at timestamptz;

create index if not exists user_task_progress_ai_feedback_created_idx
  on public.user_task_progress (ai_feedback_created_at)
  where ai_feedback_created_at is not null;
