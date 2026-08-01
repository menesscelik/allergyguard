alter table public.profiles
add column if not exists is_admin boolean not null default false;

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((
    select is_admin
    from public.profiles
    where id = auth.uid()
  ), false);
$$;

create or replace function public.admin_create_promo_code(
  p_code text,
  p_description text,
  p_premium_days integer,
  p_max_redemptions integer default null,
  p_expires_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_code));
begin
  if not public.current_user_is_admin() then
    return jsonb_build_object('success', false, 'message_key', 'not_admin');
  end if;

  if v_code = '' then
    return jsonb_build_object('success', false, 'message_key', 'empty_code');
  end if;

  if v_code !~ '^[A-Z0-9_-]{4,32}$' then
    return jsonb_build_object('success', false, 'message_key', 'bad_format');
  end if;

  if p_premium_days is null or p_premium_days <= 0 then
    return jsonb_build_object('success', false, 'message_key', 'bad_days');
  end if;

  if p_max_redemptions is not null and p_max_redemptions <= 0 then
    return jsonb_build_object('success', false, 'message_key', 'bad_limit');
  end if;

  insert into public.promo_codes (
    code,
    description,
    premium_days,
    max_redemptions,
    expires_at,
    is_active
  )
  values (
    v_code,
    nullif(trim(coalesce(p_description, '')), ''),
    p_premium_days,
    p_max_redemptions,
    p_expires_at,
    true
  );

  return jsonb_build_object('success', true, 'message_key', 'created', 'code', v_code);
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'message_key', 'duplicate');
end;
$$;

create or replace function public.admin_list_promo_codes()
returns table (
  code text,
  description text,
  premium_days integer,
  max_redemptions integer,
  redeemed_count integer,
  expires_at timestamptz,
  is_active boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_admin() then
    return;
  end if;

  return query
  select
    p.code,
    p.description,
    p.premium_days,
    p.max_redemptions,
    p.redeemed_count,
    p.expires_at,
    p.is_active,
    p.created_at
  from public.promo_codes p
  order by p.created_at desc;
end;
$$;

revoke all on function public.current_user_is_admin() from public;
revoke all on function public.admin_create_promo_code(text, text, integer, integer, timestamptz) from public;
revoke all on function public.admin_list_promo_codes() from public;

grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.admin_create_promo_code(text, text, integer, integer, timestamptz) to authenticated;
grant execute on function public.admin_list_promo_codes() to authenticated;
