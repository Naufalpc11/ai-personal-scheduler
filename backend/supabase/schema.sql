-- Supabase schema for AI Personal Scheduler
-- Run this in Supabase SQL Editor.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  task_title text not null,
  ai_generated boolean not null default false,
  description text,
  status varchar(20) not null default 'pending',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id bigserial primary key,
  task_id bigint not null references public.tasks(id) on delete cascade,
  subtask_title text not null,
  estimated_minutes int,
  is_ai_generated boolean not null default false,
  order_index int,
  description text,
  status varchar(20) not null default 'pending',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id bigserial primary key,
  task_id bigint not null references public.tasks(id) on delete cascade,
  status varchar(20) not null default 'pending',
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_auto_scheduled boolean not null default false,
  is_rescheduled boolean not null default false,
  reschedule_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_logs (
  id bigserial primary key,
  task_id bigint references public.tasks(id) on delete cascade,
  action_type varchar(64) not null,
  input_prompt text not null,
  ai_response text,
  model_used varchar(100),
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists schedules_task_id_idx on public.schedules(task_id);
create index if not exists ai_logs_task_id_idx on public.ai_logs(task_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger subtasks_set_updated_at
before update on public.subtasks
for each row execute function public.set_updated_at();

create trigger schedules_set_updated_at
before update on public.schedules
for each row execute function public.set_updated_at();
