create table if not exists public.employees_master (
  employee_id text primary key,
  prefix text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  position text not null default '',
  level text not null default '',
  department text not null default '',
  synced_at timestamptz not null default now()
);

create index if not exists employees_master_department_idx
  on public.employees_master (department);

alter table public.employees_master enable row level security;

create policy "employees_master_read"
  on public.employees_master
  for select
  using (true);
