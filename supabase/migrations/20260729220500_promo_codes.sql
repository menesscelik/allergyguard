create table if not exists public.promo_codes (
  code text primary key,
  description text,
  premium_days integer not null default 30 check (premium_days > 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code text not null references public.promo_codes(code) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  premium_until timestamptz not null,
  created_at timestamptz not null default now(),
  unique (promo_code, user_id)
);

alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;

create policy "Users can read own promo redemptions"
on public.promo_redemptions
for select
using (auth.uid() = user_id);

create index if not exists promo_redemptions_user_created_idx
on public.promo_redemptions(user_id, created_at desc);

create or replace function public.redeem_promo_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(p_code));
  v_promo public.promo_codes%rowtype;
  v_base_until timestamptz;
  v_new_until timestamptz;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message_key', 'unauthorized');
  end if;

  if v_code = '' then
    return jsonb_build_object('success', false, 'message_key', 'empty');
  end if;

  select *
    into v_promo
    from public.promo_codes
    where code = v_code
    for update;

  if not found then
    return jsonb_build_object('success', false, 'message_key', 'invalid');
  end if;

  if not v_promo.is_active then
    return jsonb_build_object('success', false, 'message_key', 'inactive');
  end if;

  if v_promo.expires_at is not null and v_promo.expires_at < now() then
    return jsonb_build_object('success', false, 'message_key', 'expired');
  end if;

  if v_promo.max_redemptions is not null and v_promo.redeemed_count >= v_promo.max_redemptions then
    return jsonb_build_object('success', false, 'message_key', 'limit');
  end if;

  if exists (
    select 1 from public.promo_redemptions
    where promo_code = v_code and user_id = v_user_id
  ) then
    return jsonb_build_object('success', false, 'message_key', 'already_used');
  end if;

  select greatest(coalesce(premium_until, now()), now())
    into v_base_until
    from public.profiles
    where id = v_user_id
    for update;

  v_new_until := v_base_until + make_interval(days => v_promo.premium_days);

  update public.profiles
    set is_premium = true,
        premium_until = v_new_until,
        updated_at = now()
    where id = v_user_id;

  insert into public.promo_redemptions (promo_code, user_id, premium_until)
  values (v_code, v_user_id, v_new_until);

  update public.promo_codes
    set redeemed_count = redeemed_count + 1
    where code = v_code;

  return jsonb_build_object(
    'success', true,
    'message_key', 'success',
    'premium_until', v_new_until,
    'premium_days', v_promo.premium_days
  );
end;
$$;

revoke all on function public.redeem_promo_code(text) from public;
grant execute on function public.redeem_promo_code(text) to authenticated;
