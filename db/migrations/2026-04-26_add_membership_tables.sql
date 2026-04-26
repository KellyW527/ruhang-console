-- ============================================================
-- 入行 RuHang · 会员制度迁移
-- ============================================================
-- 在 Supabase Dashboard → SQL Editor 中执行此文件。
--
-- 设计要点：
--   1. user_roles 单独表 —— 防止权限提升攻击（绝不在 profiles 上存角色）
--   2. subscriptions 记录月度套餐（basic/premium）+ 配额
--   3. user_entitlements 记录"已解锁的项目"，是访问控制的事实来源
--   4. orders 记录每笔 Stripe 支付审计
--   5. has_simulation_access(user_id, simulation_code) 是唯一访问校验入口
--      —— 免费用户固定能访问 ibd-ipo
--      —— 其他用户必须有有效的 entitlement
-- ============================================================

-- ---------- 1. 角色枚举 ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('free', 'basic', 'premium', 'admin');
  end if;
end$$;

-- ---------- 2. user_roles 表 ----------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'free',
  created_at timestamptz default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- 只有 service_role 能写入（webhook 通过 service_role 写）
-- 不开放 INSERT/UPDATE/DELETE 给 authenticated，防止用户自封 premium

-- ---------- 3. subscriptions 表 ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tier text not null check (tier in ('basic', 'premium')),
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'incomplete')),
  quota_total int not null,
  quota_used int not null default 0,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(user_id, status);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- 写入只允许 service_role（webhook）

-- ---------- 4. user_entitlements 表 ----------
-- 每行 = 一个用户对一个项目的访问权
create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  simulation_code text not null,
  source text not null check (source in ('free_default', 'basic', 'premium', 'single_purchase')),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  expires_at timestamptz,  -- null = 永久（单买）；订阅则跟随 current_period_end
  created_at timestamptz default now(),
  unique (user_id, simulation_code, source)
);

create index if not exists idx_entitlements_user on public.user_entitlements(user_id);
create index if not exists idx_entitlements_lookup on public.user_entitlements(user_id, simulation_code);

alter table public.user_entitlements enable row level security;

drop policy if exists "Users can view own entitlements" on public.user_entitlements;
create policy "Users can view own entitlements"
  on public.user_entitlements for select
  to authenticated
  using (auth.uid() = user_id);

-- 写入只允许 service_role（webhook + redeem-quota edge function）

-- ---------- 5. orders 审计表 ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  product_type text not null check (product_type in ('subscription_basic', 'subscription_premium', 'upgrade_diff', 'single_1', 'single_2', 'single_3')),
  amount_cents int not null,
  currency text not null default 'cny',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  paid_at timestamptz
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

alter table public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

-- 写入只允许 service_role

-- ---------- 6. has_simulation_access 函数 ----------
-- 这是访问控制的唯一入口。前后端都用它。
-- 规则：
--   - 未登录 → false
--   - ibd-ipo（兴通投行）→ 所有登录用户都能访问（免费固定项目）
--   - 其他项目 → 必须有未过期的 entitlement
create or replace function public.has_simulation_access(_user_id uuid, _simulation_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when _user_id is null then false
    when _simulation_code = 'ibd-ipo' then true
    else exists (
      select 1
      from public.user_entitlements
      where user_id = _user_id
        and simulation_code = _simulation_code
        and (expires_at is null or expires_at > now())
    )
  end;
$$;

-- ---------- 7. 当前订阅状态（用于前端展示配额）----------
create or replace function public.get_active_subscription(_user_id uuid)
returns table (
  id uuid,
  tier text,
  status text,
  quota_total int,
  quota_used int,
  quota_remaining int,
  current_period_end timestamptz,
  cancel_at_period_end boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.tier,
    s.status,
    s.quota_total,
    s.quota_used,
    (s.quota_total - s.quota_used) as quota_remaining,
    s.current_period_end,
    s.cancel_at_period_end
  from public.subscriptions s
  where s.user_id = _user_id
    and s.status = 'active'
    and s.current_period_end > now()
  order by s.created_at desc
  limit 1;
$$;

-- ---------- 8. has_role 工具函数（防权限提升）----------
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- ---------- 9. 触发器：subscriptions.updated_at ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated
  before update on public.subscriptions
  for each row
  execute function public.touch_updated_at();

-- ============================================================
-- 部署后验证：
--   select has_simulation_access(auth.uid(), 'ibd-ipo');   -- 应返回 true
--   select has_simulation_access(auth.uid(), 'ma-buyside'); -- 应返回 false（除非有 entitlement）
-- ============================================================
