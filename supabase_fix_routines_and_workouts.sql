-- ==============================================================================
-- DeV Fit: Fix Definitivo per Tabelle ROUTINES e WORKOUT_LOGS su Supabase
-- Esegui questo script completo nel SQL Editor del tuo progetto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. TABELLA ROUTINES
create table if not exists public.routines (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text default '',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now() not null
);

-- Assicura colonne necessarie se la tabella esisteva già
alter table public.routines add column if not exists user_id uuid references auth.users on delete cascade;
alter table public.routines add column if not exists description text default '';
alter table public.routines add column if not exists exercises jsonb not null default '[]'::jsonb;
alter table public.routines add column if not exists updated_at timestamp with time zone default now();

-- Rimuove righe con user_id null per evitare errori con il vincolo NOT NULL
delete from public.routines where user_id is null;
alter table public.routines alter column user_id set not null;

-- Abilita RLS (Row Level Security) e crea policy permissiva per l'utente proprietario
alter table public.routines enable row level security;
drop policy if exists "Users can manage their own routines" on public.routines;
create policy "Users can manage their own routines"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_routines_user_id on public.routines(user_id);


-- 2. TABELLA WORKOUT_LOGS
create table if not exists public.workout_logs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  date text not null,
  duration integer not null default 0,
  volume float8 not null default 0,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now() not null
);

-- Assicura tutte le colonne (metriche, BPM, calorie, cardio)
alter table public.workout_logs add column if not exists user_id uuid references auth.users on delete cascade;
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

-- Rimuove righe orfane con user_id null
delete from public.workout_logs where user_id is null;
alter table public.workout_logs alter column user_id set not null;

-- Indice di performance per recupero cronologico veloce
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, date desc);

-- Abilita RLS e policy per workout_logs
alter table public.workout_logs enable row level security;
drop policy if exists "Users can manage their own workout logs" on public.workout_logs;
create policy "Users can manage their own workout logs"
  on public.workout_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. VERIFICA STATO
select 'Tabelle routines e workout_logs aggiornate con successo con RLS e tutte le colonne necessarie!' as risultato;
