-- Anchor schema: habits + daily check-ins, locked down with row-level security
-- so every user can only read and write their own rows.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 280),
  color text not null default '#2f6f73',
  target_per_week smallint not null default 7 check (target_per_week between 1 and 7),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, day)
);

create index habits_user_id_idx on public.habits(user_id);
create index habit_checkins_user_id_idx on public.habit_checkins(user_id);
create index habit_checkins_habit_day_idx on public.habit_checkins(habit_id, day);

alter table public.habits enable row level security;
alter table public.habit_checkins enable row level security;

create policy "habits_select_own" on public.habits for select to authenticated using ((select auth.uid()) = user_id);
create policy "habits_insert_own" on public.habits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "habits_update_own" on public.habits for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "habits_delete_own" on public.habits for delete to authenticated using ((select auth.uid()) = user_id);

create policy "checkins_select_own" on public.habit_checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy "checkins_insert_own" on public.habit_checkins for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid()))
);
create policy "checkins_delete_own" on public.habit_checkins for delete to authenticated using ((select auth.uid()) = user_id);
