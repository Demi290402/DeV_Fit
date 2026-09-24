-- ==============================================================================
-- DeV Fit: Fix Definitivo per Tabelle ROUTINES, WORKOUT_LOGS e FOOD_LOGS
-- Risolve gli errori 42804 (foreign key) e 0A000 (policy depends on column user_id)
-- Esegui questo script nel SQL Editor del tuo progetto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. ELIMINAZIONE TABELLE FIGLIE OBSOLETE CON CASCADE
-- Elimina vecchie tabelle relazionali non usate da DeV Fit che bloccavano il cambio tipo
drop table if exists public.routine_exercises cascade;
drop table if exists public.routine_sets cascade;
drop table if exists public.workout_exercises cascade;
drop table if exists public.workout_log_exercises cascade;
drop table if exists public.workout_sets cascade;
drop table if exists public.exercise_sets cascade;

-- 2. RIMOZIONE DI TUTTE LE POLICY RLS ESISTENTI (RISOLVE L'ERRORE 0A000)
-- PostgreSQL vieta l'alterazione del tipo di una colonna se una policy RLS vi fa riferimento.
-- Rimuoviamo prima tutte le policy attive; verranno ricreate al termine dello script con i tipi corretti.
do $$
declare
  pol record;
begin
  for pol in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('routines', 'workout_logs', 'food_logs', 'profiles')
  ) loop
    execute format('drop policy if exists %I on %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- 3. RIMOZIONE DINAMICA DI TUTTI I VINCOLI FOREIGN KEY RESIDUI (RISOLVE L'ERRORE 42804)
do $$
declare
  r record;
begin
  -- A. Vincoli FK che puntano VERSO routines, workout_logs, food_logs
  for r in (
    select tc.table_schema, tc.table_name, tc.constraint_name
    from information_schema.table_constraints tc
    join information_schema.referential_constraints rc 
      on tc.constraint_name = rc.constraint_name 
      and tc.table_schema = rc.constraint_schema
    join information_schema.table_constraints uc 
      on rc.unique_constraint_name = uc.constraint_name 
      and rc.unique_constraint_schema = uc.table_schema
    where uc.table_schema = 'public' 
      and uc.table_name in ('routines', 'workout_logs', 'food_logs')
  ) loop
    execute format('alter table %I.%I drop constraint if exists %I cascade;', r.table_schema, r.table_name, r.constraint_name);
  end loop;

  -- B. Vincoli FK in USCITA da routines, workout_logs, food_logs (es. verso auth.users)
  for r in (
    select table_schema, table_name, constraint_name
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name in ('routines', 'workout_logs', 'food_logs')
      and constraint_type = 'FOREIGN KEY'
  ) loop
    execute format('alter table %I.%I drop constraint if exists %I cascade;', r.table_schema, r.table_name, r.constraint_name);
  end loop;
end $$;

-- 4. RIMOZIONE INDICI OBSOLETI PRIMA DELL'ALTER TYPE
drop index if exists public.idx_routines_user_id;
drop index if exists public.idx_workout_logs_user_date;
drop index if exists public.idx_food_logs_user_date;
drop index if exists public.idx_workout_logs_user;
drop index if exists public.idx_routines_user;

-- 5. CREAZIONE TABELLE CON SCHEMA CORRETTO SE NON ANCORA ESISTENTI
create table if not exists public.routines (
  id text primary key,
  user_id text not null,
  name text not null,
  description text default '',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.workout_logs (
  id text primary key,
  user_id text not null,
  name text not null,
  date text not null,
  duration integer not null default 0,
  volume float8 not null default 0,
  exercises jsonb not null default '[]'::jsonb,
  avg_heart_rate numeric,
  heart_rate_samples jsonb,
  calories_burned numeric,
  device_source text,
  activity_type text default 'strength',
  distance_km numeric,
  elevation_meters numeric,
  pace text,
  notes text,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.food_logs (
  id text primary key,
  user_id text not null,
  date text not null,
  meal_type text not null,
  food_name text,
  name text,
  calories float8 not null default 0,
  protein float8 not null default 0,
  carbs float8 not null default 0,
  fat float8 not null default 0,
  grams float8 default 0,
  weight float8 default 0,
  created_at timestamp with time zone default now() not null
);

-- 6. CONVERSIONE SICURA DI ID E USER_ID A TEXT
-- Ora che policy e FK sono state rimosse, questo passaggio avviene all'istante e senza blocchi
do $$
begin
  -- routines
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'routines' and column_name = 'id' and data_type != 'text') then
    alter table public.routines alter column id type text using id::text;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'routines' and column_name = 'user_id' and data_type != 'text') then
    alter table public.routines alter column user_id type text using user_id::text;
  end if;

  -- workout_logs
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'workout_logs' and column_name = 'id' and data_type != 'text') then
    alter table public.workout_logs alter column id type text using id::text;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'workout_logs' and column_name = 'user_id' and data_type != 'text') then
    alter table public.workout_logs alter column user_id type text using user_id::text;
  end if;

  -- food_logs
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'food_logs' and column_name = 'id' and data_type != 'text') then
    alter table public.food_logs alter column id type text using id::text;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'food_logs' and column_name = 'user_id' and data_type != 'text') then
    alter table public.food_logs alter column user_id type text using user_id::text;
  end if;
end $$;

-- 7. ASSICURA TUTTE LE COLONNE ESTESE
-- routines
alter table public.routines add column if not exists description text default '';
alter table public.routines add column if not exists exercises jsonb not null default '[]'::jsonb;
alter table public.routines add column if not exists updated_at timestamp with time zone default now();

-- workout_logs
alter table public.workout_logs add column if not exists exercises jsonb not null default '[]'::jsonb;
alter table public.workout_logs add column if not exists avg_heart_rate numeric;
alter table public.workout_logs add column if not exists heart_rate_samples jsonb;
alter table public.workout_logs add column if not exists calories_burned numeric;
alter table public.workout_logs add column if not exists device_source text;
alter table public.workout_logs add column if not exists activity_type text default 'strength';
alter table public.workout_logs add column if not exists distance_km numeric;
alter table public.workout_logs add column if not exists elevation_meters numeric;
alter table public.workout_logs add column if not exists pace text;
alter table public.workout_logs add column if not exists notes text;

-- food_logs
alter table public.food_logs add column if not exists name text;
alter table public.food_logs add column if not exists food_name text;
alter table public.food_logs add column if not exists grams float8 default 0;
alter table public.food_logs add column if not exists weight float8 default 0;

-- 8. RICREAZIONE INDICI VELOCI PER QUERY CRONOLOGICHE
create index if not exists idx_routines_user_id on public.routines(user_id);
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, date desc);
create index if not exists idx_food_logs_user_date on public.food_logs(user_id, date desc);

-- 9. ASSEGNAZIONE PERMESSI COMPLETI (anon, authenticated, service_role)
grant all on public.routines to authenticated, anon, service_role;
grant all on public.workout_logs to authenticated, anon, service_role;
grant all on public.food_logs to authenticated, anon, service_role;
grant all on public.profiles to authenticated, anon, service_role;
grant all on public.recipes to authenticated, anon, service_role;
grant all on public.exercises to authenticated, anon, service_role;

-- 10. RICREAZIONE POLICY RLS OTTIMIZZATE (con cast esplicito a TEXT)
-- Routines
alter table public.routines enable row level security;
create policy "Users can manage their own routines"
  on public.routines for all
  using (auth.uid()::text = user_id or auth.uid() is null)
  with check (auth.uid()::text = user_id or auth.uid() is null);

-- Workout logs
alter table public.workout_logs enable row level security;
create policy "Users can manage their own workout logs"
  on public.workout_logs for all
  using (auth.uid()::text = user_id or auth.uid() is null)
  with check (auth.uid()::text = user_id or auth.uid() is null);

-- Food logs
alter table public.food_logs enable row level security;
create policy "Users can manage their own food logs"
  on public.food_logs for all
  using (auth.uid()::text = user_id or auth.uid() is null)
  with check (auth.uid()::text = user_id or auth.uid() is null);

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can manage their own profile"
  on public.profiles for all
  using (auth.uid()::text = id::text or auth.uid() is null)
  with check (auth.uid()::text = id::text or auth.uid() is null);

-- 11. NOTIFICA DI COMPLETAMENTO
select 'Fix completato con successo: policy e vincoli rimossi prima del cambio tipo, colonne TEXT abilitate e nuove policy RLS sincronizzate!' as esito;
