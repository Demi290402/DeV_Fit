-- ==============================================================================
-- DEV FIT - SCRIPT MASTER DI MIGRAZIONE COMPLETO PER SUPABASE
-- Esegui questo script nel SQL Editor di Supabase (icona '>_' nel menu a sinistra)
-- ==============================================================================

-- 1. TABELLA PROFILES (Dati Fisici, Target Macro e Preferenze Utente)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Utente',
  gender text not null default 'male',
  height float8 not null default 175,
  weight float8 not null default 75,
  body_fat float8 not null default 15,
  waist float8 not null default 80,
  arms float8 not null default 35,
  thighs float8 not null default 55,
  avatar_url text,
  banner_url text,
  target_calories integer not null default 2200,
  target_protein integer not null default 150,
  target_carbs integer not null default 250,
  target_fat integer not null default 70,
  streak integer not null default 1,
  last_logged_date date not null default current_date,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Assicura che tutte le colonne necessarie esistano anche se la tabella era gia presente
alter table public.profiles add column if not exists name text not null default 'Utente';
alter table public.profiles add column if not exists gender text not null default 'male';
alter table public.profiles add column if not exists height float8 not null default 175;
alter table public.profiles add column if not exists weight float8 not null default 75;
alter table public.profiles add column if not exists body_fat float8 not null default 15;
alter table public.profiles add column if not exists waist float8 not null default 80;
alter table public.profiles add column if not exists arms float8 not null default 35;
alter table public.profiles add column if not exists thighs float8 not null default 55;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists target_calories integer not null default 2200;
alter table public.profiles add column if not exists target_protein integer not null default 150;
alter table public.profiles add column if not exists target_carbs integer not null default 250;
alter table public.profiles add column if not exists target_fat integer not null default 70;
alter table public.profiles add column if not exists streak integer not null default 1;
alter table public.profiles add column if not exists last_logged_date date not null default current_date;
alter table public.profiles add column if not exists created_at timestamp with time zone not null default now();
alter table public.profiles add column if not exists updated_at timestamp with time zone not null default now();

-- RLS per profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);


-- 2. TRIGGER AUTOMATICO: crea automaticamente la riga in public.profiles appena un utente si registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_full_name text;
begin
  user_full_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'Utente DeV Fit'
  );

  insert into public.profiles (
    id,
    name,
    gender,
    height,
    weight,
    body_fat,
    waist,
    arms,
    thighs,
    target_calories,
    target_protein,
    target_carbs,
    target_fat,
    streak,
    last_logged_date
  )
  values (
    new.id,
    user_full_name,
    'male',
    175,
    75,
    15,
    80,
    35,
    55,
    2200,
    150,
    250,
    70,
    1,
    current_date
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, profiles.name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 3. RECUPERO RETROATTIVO PROFILI
insert into public.profiles (
  id,
  name,
  gender,
  height,
  weight,
  body_fat,
  waist,
  arms,
  thighs,
  target_calories,
  target_protein,
  target_carbs,
  target_fat,
  streak,
  last_logged_date
)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1),
    'Utente'
  ),
  'male',
  175,
  75,
  15,
  80,
  35,
  55,
  2200,
  150,
  250,
  70,
  1,
  current_date
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;


-- 4. TABELLA ROUTINES (Schede di Allenamento)
create table if not exists public.routines (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text default '',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now() not null
);

alter table public.routines add column if not exists user_id uuid references auth.users on delete cascade;
alter table public.routines add column if not exists exercises jsonb not null default '[]'::jsonb;
alter table public.routines enable row level security;

drop policy if exists "Users can manage their own routines" on public.routines;
create policy "Users can manage their own routines"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 5. TABELLA WORKOUT_LOGS (Cronologia Allenamenti Svolti)
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

alter table public.workout_logs add column if not exists user_id uuid references auth.users on delete cascade;
alter table public.workout_logs add column if not exists exercises jsonb not null default '[]'::jsonb;
alter table public.workout_logs enable row level security;

drop policy if exists "Users can manage their own workout logs" on public.workout_logs;
create policy "Users can manage their own workout logs"
  on public.workout_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 6. TABELLA FOOD_LOGS (Diario Alimentare)
create table if not exists public.food_logs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  name text not null,
  meal_type text not null,
  calories float8 not null default 0,
  protein float8 not null default 0,
  carbs float8 not null default 0,
  fat float8 not null default 0,
  weight float8 not null default 0,
  created_at timestamp with time zone default now() not null
);

alter table public.food_logs add column if not exists user_id uuid references auth.users on delete cascade;
alter table public.food_logs enable row level security;

drop policy if exists "Users can manage their own food logs" on public.food_logs;
create policy "Users can manage their own food logs"
  on public.food_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 7. TABELLA EXERCISES (Catalogo Esercizi Ufficiali & Esercizi Personalizzati Utente)
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  category text not null,
  muscle_group text not null,
  secondary_muscles text[] default '{}',
  equipment text not null,
  tracking_type text not null default 'weight_reps',
  instructions text not null default '',
  execution_tips text default '',
  video_url text default '',
  is_custom boolean not null default false,
  created_by uuid references auth.users on delete cascade,
  created_at timestamp with time zone default now() not null
);

alter table public.exercises add column if not exists secondary_muscles text[] default '{}';
alter table public.exercises add column if not exists execution_tips text default '';
alter table public.exercises add column if not exists tracking_type text not null default 'weight_reps';
alter table public.exercises add column if not exists is_custom boolean not null default false;
alter table public.exercises add column if not exists created_by uuid references auth.users on delete cascade;
alter table public.exercises enable row level security;

-- Politiche RLS per exercises:
drop policy if exists "Anyone can read system exercises and own custom exercises" on public.exercises;
create policy "Anyone can read system exercises and own custom exercises"
  on public.exercises for select
  using (is_custom = false or auth.uid() = created_by);

drop policy if exists "Users can insert their own custom exercises" on public.exercises;
create policy "Users can insert their own custom exercises"
  on public.exercises for insert
  with check (is_custom = true and auth.uid() = created_by);

drop policy if exists "Users can update their own custom exercises" on public.exercises;
create policy "Users can update their own custom exercises"
  on public.exercises for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Users can delete their own custom exercises" on public.exercises;
create policy "Users can delete their own custom exercises"
  on public.exercises for delete
  using (auth.uid() = created_by);


-- 8. INDICI DI PERFORMANCE
create index if not exists idx_workout_logs_user on public.workout_logs(user_id);
create index if not exists idx_routines_user on public.routines(user_id);
create index if not exists idx_food_logs_user_date on public.food_logs(user_id, date);
create index if not exists idx_exercises_custom on public.exercises(is_custom, created_by);
create index if not exists idx_exercises_muscle on public.exercises(muscle_group);

-- ==============================================================================
-- NOTA IMPORTANTE AUTENTICAZIONE MULTI-DISPOSITIVO (PC & CELLULARE):
-- Nel pannello Supabase:
-- 1. Vai in "Authentication" -> "Providers" -> "Email".
-- 2. DISATTIVA l'opzione "Confirm email" se desideri che gli utenti possano accedere
--    subito sia da cellulare che da PC senza dover aspettare o confermare via link email.
-- ==============================================================================