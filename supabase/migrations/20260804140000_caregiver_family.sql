-- Aile / bakıcı takibi (v1: salt-okunur uzaktan takip)
--
-- Rıza akışı: takip edilecek kişi (owner, ör. anne) bir davet kodu üretir;
-- takip eden kişi (caregiver, ör. oğul) kodu girip bağ kurar. Bakıcı yalnızca
-- owner'ın hatırlatıcılarını ve ilaç kayıtlarını OKUYABİLİR (yazamaz).

create table if not exists public.caregiver_links (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade, -- takip edilen
  caregiver_id uuid not null references public.profiles(id) on delete cascade, -- takip eden
  created_at   timestamptz default now(),
  unique (owner_id, caregiver_id),
  check (owner_id <> caregiver_id)
);

create table if not exists public.caregiver_invites (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  expires_at  timestamptz not null,
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz
);

alter table public.caregiver_links enable row level security;
alter table public.caregiver_invites enable row level security;

-- Kişi dahil olduğu bağları görebilir/silebilir (her iki taraf da bağı kaldırabilir).
create policy "caregiver_links_self" on public.caregiver_links
  for select using (auth.uid() = owner_id or auth.uid() = caregiver_id);
create policy "caregiver_links_delete" on public.caregiver_links
  for delete using (auth.uid() = owner_id or auth.uid() = caregiver_id);

-- Davetleri sadece sahibi görür/siler (oluşturma/kullanım fonksiyonlarla).
create policy "caregiver_invites_owner_select" on public.caregiver_invites
  for select using (auth.uid() = owner_id);
create policy "caregiver_invites_owner_delete" on public.caregiver_invites
  for delete using (auth.uid() = owner_id);

-- RLS içinde tekrar RLS'e girmemek için yardımcı (definer, RLS'i baypas eder).
create or replace function public.is_caregiver_of(p_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.caregiver_links
    where owner_id = p_owner and caregiver_id = auth.uid()
  );
$$;
revoke all on function public.is_caregiver_of(uuid) from public;
grant execute on function public.is_caregiver_of(uuid) to authenticated;

-- Bakıcı, owner'ın verilerini OKUYABİLİR (mevcut own-row politikalarına ek).
create policy "reminders_caregiver_read" on public.medication_reminders
  for select using (public.is_caregiver_of(user_id));

create policy "intake_logs_caregiver_read" on public.medication_intake_logs
  for select using (public.is_caregiver_of(user_id));

create policy "profiles_caregiver_read" on public.profiles
  for select using (public.is_caregiver_of(id));

-- ---------- Fonksiyonlar ----------

-- Owner davet kodu üretir (24 saat geçerli).
create or replace function public.create_caregiver_invite()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') for 8));
  insert into public.caregiver_invites (code, owner_id, expires_at)
    values (v_code, auth.uid(), now() + interval '24 hours');
  return v_code;
end;
$$;
revoke all on function public.create_caregiver_invite() from public;
grant execute on function public.create_caregiver_invite() to authenticated;

-- Caregiver kodu kullanır ve bağ kurulur.
create or replace function public.redeem_caregiver_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.caregiver_invites;
  v_owner_name text;
begin
  select * into v_invite from public.caregiver_invites
    where code = upper(trim(p_code)) limit 1;

  if v_invite.id is null then
    return jsonb_build_object('success', false, 'message_key', 'invalid');
  end if;
  if v_invite.redeemed_by is not null then
    return jsonb_build_object('success', false, 'message_key', 'used');
  end if;
  if v_invite.expires_at < now() then
    return jsonb_build_object('success', false, 'message_key', 'expired');
  end if;
  if v_invite.owner_id = auth.uid() then
    return jsonb_build_object('success', false, 'message_key', 'self');
  end if;

  insert into public.caregiver_links (owner_id, caregiver_id)
    values (v_invite.owner_id, auth.uid())
    on conflict (owner_id, caregiver_id) do nothing;

  update public.caregiver_invites
    set redeemed_by = auth.uid(), redeemed_at = now()
    where id = v_invite.id;

  select full_name into v_owner_name from public.profiles where id = v_invite.owner_id;
  return jsonb_build_object('success', true, 'owner_name', coalesce(v_owner_name, ''));
end;
$$;
revoke all on function public.redeem_caregiver_invite(text) from public;
grant execute on function public.redeem_caregiver_invite(text) to authenticated;

-- Her iki yöndeki bağları isimleriyle döndürür.
create or replace function public.list_family()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'tracking', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'link_id', cl.id, 'user_id', p.id, 'name', p.full_name, 'username', p.username)), '[]'::jsonb)
      from public.caregiver_links cl
      join public.profiles p on p.id = cl.owner_id
      where cl.caregiver_id = auth.uid()
    ),
    'trackers', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'link_id', cl.id, 'user_id', p.id, 'name', p.full_name, 'username', p.username)), '[]'::jsonb)
      from public.caregiver_links cl
      join public.profiles p on p.id = cl.caregiver_id
      where cl.owner_id = auth.uid()
    )
  );
$$;
grant execute on function public.list_family() to authenticated;
