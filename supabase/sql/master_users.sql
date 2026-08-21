-- Smart Factory: master.users
-- Paste this entire script into Supabase SQL Editor and click Run.

create schema if not exists master;

grant usage on schema master to postgres, anon, authenticated, service_role;
grant all on schema master to service_role;

create table if not exists master.users (
  employee_id text primary key,
  prefix text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  position text not null default '',
  level text not null default '',
  department text not null default '',
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_department_idx
  on master.users (department);

create index if not exists users_last_name_idx
  on master.users (last_name);

create or replace function master.set_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on master.users;

create trigger users_set_updated_at
before update on master.users
for each row
execute function master.set_users_updated_at();

alter table master.users enable row level security;

drop policy if exists "users_read" on master.users;

create policy "users_read"
  on master.users
  for select
  to anon, authenticated
  using (true);

grant select on master.users to anon, authenticated;
grant select, insert, update, delete on master.users to service_role;

comment on table master.users is 'Employee master synced from Google Sheets';
comment on column master.users.employee_id is 'Employee ID from Google Sheet column employee_ID';

-- After running this script:
-- Supabase Dashboard -> Project Settings -> API -> Exposed schemas -> add "master"
