-- ==============================================================================
-- DEV FIT - SCRIPT COMPLETO DI INIZIALIZZAZIONE SUPABASE
-- Esegui questo script nel SQL Editor di Supabase (icona '>_' nella barra a sinistra)
-- ==============================================================================

-- 1. TABELLA PROFILES (Profili Utente)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Utente',
  gender text not null default 'male' check (gender in ('male', 'female')),
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
  last_logged_date text not null default to_char(now(), 'YYYY-MM-DD'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assicura che tutte le colonne necessarie esistano anche se la tabella era già stata creata
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='target_calories') then
    alter table public.profiles add column target_calories integer not null default 2200;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='target_protein') then
    alter table public.profiles add column target_protein integer not null default 150;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='target_carbs') then
    alter table public.profiles add column target_carbs integer not null default 250;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='target_fat') then
    alter table public.profiles add column target_fat integer not null default 70;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='streak') then
    alter table public.profiles add column streak integer not null default 1;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='last_logged_date') then
    alter table public.profiles add column last_logged_date text not null default to_char(now(), 'YYYY-MM-DD');
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='banner_url') then
    alter table public.profiles add column banner_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='created_at') then
    alter table public.profiles add column created_at timestamp with time zone default timezone('utc'::text, now()) not null default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='updated_at') then
    alter table public.profiles add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null default now();
  end if;
end $$;

-- Abilita Row Level Security (RLS) su profiles
alter table public.profiles enable row level security;

-- Politiche di sicurezza RLS su profiles (ognuno legge e modifica solo il suo profilo)
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


-- 2. TRIGGER AUTOMATICO SU auth.users (Crea automaticamente la riga in public.profiles appena un utente si registra)
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
    to_char(now(), 'YYYY-MM-DD')
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


-- 3. RECUPERO RETROATTIVO: SE CI SONO GIÀ UTENTI IN auth.users, CREA ORA I LORO PROFILI IN public.profiles
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
  to_char(now(), 'YYYY-MM-DD')
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.food_logs enable row level security;

drop policy if exists "Users can manage their own food logs" on public.food_logs;
create policy "Users can manage their own food logs"
  on public.food_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indici di performance per velocizzare le query per utente e data
create index if not exists idx_workout_logs_user on public.workout_logs(user_id);
create index if not exists idx_routines_user on public.routines(user_id);
create index if not exists idx_food_logs_user_date on public.food_logs(user_id, date);
