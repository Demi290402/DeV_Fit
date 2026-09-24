-- ==============================================================================
-- DeV Fit: Fix Definitivo per Tabelle ROUTINES e WORKOUT_LOGS su Supabase
-- Esegui questo script completo nel SQL Editor del tuo progetto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. TABELLA ROUTINES (Schede di allenamento)
create table if not exists public.routines (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text default '',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now() not null
);

-- Assicura che la colonna id sia TEXT (fondamentale se la tabella era stata creata con id UUID)
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'routines' and column_name = 'id' and data_type != 'text'
  ) then
    alter table public.routines alter column id type text;
  end if;
end $$;

-- Assicura colonne necessarie se la tabella esisteva già
alter table public.routines add column if not exists user_id uuid references auth.users on delete cascade;
alter table public.routines add column if not exists description text default '';
alter table public.routines add column if not exists exercises jsonb not null default '[]'::jsonb;
alter table public.routines add column if not exists updated_at timestamp with time zone default now();

-- Rimuove eventuali righe orfane con user_id null
delete from public.routines where user_id is null;
alter table public.routines alter column user_id set not null;

-- Permessi di accesso per il client Supabase
grant all on public.routines to authenticated;
grant all on public.routines to service_role;
grant select, insert, update, delete on public.routines to anon;

-- Abilita RLS (Row Level Security) e crea policy permissiva
alter table public.routines enable row level security;
drop policy if exists "Users can manage their own routines" on public.routines;
create policy "Users can manage their own routines"
  on public.routines for all
  using (auth.uid() = user_id or auth.uid() is null)
  with check (auth.uid() = user_id or auth.uid() is null);

create index if not exists idx_routines_user_id on public.routines(user_id);


-- 2. TABELLA WORKOUT_LOGS (Cronologia degli allenamenti svolti)
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

-- Assicura che la colonna id sia TEXT (fondamentale per ID come 'past-log-12345' o 'log-12345')
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workout_logs' and column_name = 'id' and data_type != 'text'
  ) then
    alter table public.workout_logs alter column id type text;
  end if;
end $$;

-- Assicura tutte le colonne (metriche, BPM, cardio, calorie scientifiche)
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

-- Permessi di accesso per il client Supabase
grant all on public.workout_logs to authenticated;
grant all on public.workout_logs to service_role;
grant select, insert, update, delete on public.workout_logs to anon;

-- Indice di performance per recupero cronologico veloce
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, date desc);

-- Abilita RLS e policy per workout_logs (supporta sia sessioni attive che fallback)
alter table public.workout_logs enable row level security;
drop policy if exists "Users can manage their own workout logs" on public.workout_logs;
create policy "Users can manage their own workout logs"
  on public.workout_logs for all
  using (auth.uid() = user_id or auth.uid() is null)
  with check (auth.uid() = user_id or auth.uid() is null);


-- 3. PERMESSI COMPLETI SU PROFILES E FOOD_LOGS
grant all on public.profiles to authenticated, anon, service_role;
grant all on public.food_logs to authenticated, anon, service_role;


-- 4. VERIFICA STATO FINALE
select 'Tabelle routines e workout_logs aggiornate con successo: ID TEXT, GRANT completi e Policy RLS permissive!' as risultato;
