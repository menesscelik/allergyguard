-- ============================================================
-- AllergyGuard — Faz 1 Veritabanı Şeması
-- Supabase Dashboard → SQL Editor → New Query → yapıştır → Run
-- ============================================================

-- ---------- Tablo 1: profiles ----------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  username      text,
  birth_date    date,
  language      text default 'tr',        -- 'tr' | 'en'
  is_premium    boolean default false,
  premium_until timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Her yeni kullanıcıda otomatik profil oluştur (kayıt formundaki ad da gelir)
create unique index profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, birth_date)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    nullif(lower(trim(new.raw_user_meta_data->>'username')), ''),
    nullif(new.raw_user_meta_data->>'birth_date', '')::date
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Tablo 2: allergies ----------
create table allergies (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  drug_name             text not null,
  drug_name_en          text,
  active_ingredients    jsonb default '[]',
  active_ingredients_en jsonb default '[]',
  rxcui                 text,
  barcode               text,
  reaction_notes        text,
  severity              text default 'unknown'
                        check (severity in ('mild','moderate','severe','unknown')),
  created_at            timestamptz default now()
);

-- ---------- Tablo 3: drug_checks ----------
create table drug_checks (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  tested_drug_name      text not null,
  tested_drug_name_en   text,
  tested_ingredients    jsonb default '[]',
  tested_ingredients_en jsonb default '[]',
  risk_level            text not null check (risk_level in ('safe','warning','danger')),
  matched_ingredients   jsonb default '[]',
  ai_explanation        text,
  ai_recommendation     text,
  language              text default 'tr',
  created_at            timestamptz default now()
);

-- ---------- Tablo 4: weekly_usage ----------
create table weekly_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  week_start  date not null,
  check_count int default 0,
  unique(user_id, week_start)
);

create function get_current_week_usage(p_user_id uuid)
returns int as $$
declare
  v_week_start date := date_trunc('week', now())::date;
  v_count int;
begin
  select check_count into v_count
  from weekly_usage
  where user_id = p_user_id and week_start = v_week_start;
  return coalesce(v_count, 0);
end;
$$ language plpgsql security definer set search_path = public;

-- ---------- Tablo 5: medication_reminders ----------
create table medication_reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  drug_name     text not null,
  allergy_id    uuid references allergies(id) on delete set null,
  remind_time   time not null,
  repeat_days   jsonb default '[1,2,3,4,5,6,7]',
  is_active     boolean default true,
  notes         text,
  created_at    timestamptz default now()
);

-- ---------- Tablo 6: push_tokens ----------
create table push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  token       text not null unique,
  platform    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- Tablo 7: notifications_log ----------
create table notifications_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  reminder_id   uuid references medication_reminders(id) on delete set null,
  type          text not null,
  title         text,
  body          text,
  sent_at       timestamptz default now(),
  status        text default 'sent'
);

-- ---------- Tablo 8: subscriptions ----------
create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  revenuecat_user_id text unique,
  product_id         text,
  status             text default 'active',
  started_at         timestamptz,
  expires_at         timestamptz,
  updated_at         timestamptz default now()
);

-- ---------- İndeksler ----------
create index idx_allergies_user on allergies(user_id);
create index idx_drug_checks_user on drug_checks(user_id);
create index idx_weekly_usage_user_week on weekly_usage(user_id, week_start);
create index idx_reminders_active on medication_reminders(remind_time, is_active);
create index idx_push_tokens_user on push_tokens(user_id);
create index idx_notifications_user on notifications_log(user_id);

-- ---------- Row Level Security ----------
alter table profiles enable row level security;
alter table allergies enable row level security;
alter table drug_checks enable row level security;
alter table weekly_usage enable row level security;
alter table medication_reminders enable row level security;
alter table push_tokens enable row level security;
alter table notifications_log enable row level security;
alter table subscriptions enable row level security;

-- profiles: kullanıcı kendi profilini görür ve günceller (insert'ü trigger yapar)
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- allergies: tam CRUD, sadece kendi kayıtları
create policy "allergies_all_own" on allergies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- drug_checks: kendi kayıtlarını görür (yazma işlemi Faz 2'de Edge Function ile)
create policy "drug_checks_select_own" on drug_checks
  for select using (auth.uid() = user_id);

-- weekly_usage: kendi kullanımını görür (yazma Edge Function ile)
create policy "weekly_usage_select_own" on weekly_usage
  for select using (auth.uid() = user_id);

-- medication_reminders: tam CRUD
create policy "reminders_all_own" on medication_reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- push_tokens: tam CRUD (token kaydı istemciden yapılır)
create policy "push_tokens_all_own" on push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notifications_log: sadece okuma (yazma service_role ile)
create policy "notifications_select_own" on notifications_log
  for select using (auth.uid() = user_id);

-- subscriptions: sadece okuma (yazma RevenueCat webhook'u ile)
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

-- Analiz kaydı + haftalık kota tek transaction içinde işlenir.
-- Tam tanım: supabase/migrations/20260705203000_atomic_drug_check_quota.sql
