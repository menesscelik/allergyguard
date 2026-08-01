create or replace function public.admin_grant_premium_by_email(
  p_email text,
  p_premium_days integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_target_user_id uuid;
  v_base_until timestamptz;
  v_new_until timestamptz;
begin
  if not public.current_user_is_admin() then
    return jsonb_build_object('success', false, 'message_key', 'not_admin');
  end if;

  if v_email = '' then
    return jsonb_build_object('success', false, 'message_key', 'empty_email');
  end if;

  if p_premium_days is null or p_premium_days <= 0 then
    return jsonb_build_object('success', false, 'message_key', 'bad_days');
  end if;

  select id
    into v_target_user_id
    from auth.users
    where lower(email) = v_email
    limit 1;

  if v_target_user_id is null then
    return jsonb_build_object('success', false, 'message_key', 'user_not_found');
  end if;

  insert into public.profiles (id)
  values (v_target_user_id)
  on conflict (id) do nothing;

  select greatest(coalesce(premium_until, now()), now())
    into v_base_until
    from public.profiles
    where id = v_target_user_id
    for update;

  v_new_until := v_base_until + make_interval(days => p_premium_days);

  update public.profiles
    set is_premium = true,
        premium_until = v_new_until,
        updated_at = now()
    where id = v_target_user_id;

  return jsonb_build_object(
    'success', true,
    'message_key', 'premium_granted',
    'email', v_email,
    'premium_until', v_new_until
  );
end;
$$;

create or replace function public.admin_set_admin_by_email(
  p_email text,
  p_is_admin boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_target_user_id uuid;
begin
  if not public.current_user_is_admin() then
    return jsonb_build_object('success', false, 'message_key', 'not_admin');
  end if;

  if v_email = '' then
    return jsonb_build_object('success', false, 'message_key', 'empty_email');
  end if;

  select id
    into v_target_user_id
    from auth.users
    where lower(email) = v_email
    limit 1;

  if v_target_user_id is null then
    return jsonb_build_object('success', false, 'message_key', 'user_not_found');
  end if;

  if v_target_user_id = auth.uid() and p_is_admin = false then
    return jsonb_build_object('success', false, 'message_key', 'cannot_remove_self');
  end if;

  insert into public.profiles (id)
  values (v_target_user_id)
  on conflict (id) do nothing;

  update public.profiles
    set is_admin = p_is_admin,
        updated_at = now()
    where id = v_target_user_id;

  return jsonb_build_object(
    'success', true,
    'message_key', case when p_is_admin then 'admin_granted' else 'admin_removed' end,
    'email', v_email,
    'is_admin', p_is_admin
  );
end;
$$;

revoke all on function public.admin_grant_premium_by_email(text, integer) from public;
revoke all on function public.admin_set_admin_by_email(text, boolean) from public;

grant execute on function public.admin_grant_premium_by_email(text, integer) to authenticated;
grant execute on function public.admin_set_admin_by_email(text, boolean) to authenticated;
