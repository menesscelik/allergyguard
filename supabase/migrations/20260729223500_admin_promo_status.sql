create or replace function public.admin_set_promo_code_active(
  p_code text,
  p_is_active boolean
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

  update public.promo_codes
    set is_active = p_is_active
    where code = v_code;

  if not found then
    return jsonb_build_object('success', false, 'message_key', 'not_found');
  end if;

  return jsonb_build_object(
    'success', true,
    'message_key', case when p_is_active then 'activated' else 'deactivated' end,
    'code', v_code,
    'is_active', p_is_active
  );
end;
$$;

revoke all on function public.admin_set_promo_code_active(text, boolean) from public;
grant execute on function public.admin_set_promo_code_active(text, boolean) to authenticated;
