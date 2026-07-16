-- Atomically enforce the weekly free quota and record the completed analysis.
-- Locking the profile row serializes concurrent checks for the same user.
create or replace function public.record_drug_check_with_quota(
  p_user_id uuid,
  p_tested_drug_name text,
  p_tested_ingredients jsonb,
  p_risk_level text,
  p_matched_ingredients jsonb,
  p_explanation text,
  p_recommendation text,
  p_language text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_premium boolean;
  v_week_start date := date_trunc('week', now())::date;
  v_new_count int;
begin
  select is_premium
    into v_is_premium
    from profiles
   where id = p_user_id
   for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  if not coalesce(v_is_premium, false) then
    insert into weekly_usage (user_id, week_start, check_count)
    values (p_user_id, v_week_start, 0)
    on conflict (user_id, week_start) do nothing;

    update weekly_usage
       set check_count = check_count + 1
     where user_id = p_user_id
       and week_start = v_week_start
       and check_count < 1
    returning check_count into v_new_count;

    if v_new_count is null then
      return jsonb_build_object('allowed', false, 'remaining_checks', 0);
    end if;
  end if;

  insert into drug_checks (
    user_id, tested_drug_name, tested_ingredients, risk_level,
    matched_ingredients, ai_explanation, ai_recommendation, language
  ) values (
    p_user_id, p_tested_drug_name, coalesce(p_tested_ingredients, '[]'::jsonb), p_risk_level,
    coalesce(p_matched_ingredients, '[]'::jsonb), p_explanation, p_recommendation, p_language
  );

  return jsonb_build_object(
    'allowed', true,
    'remaining_checks', case when v_is_premium then null else 0 end
  );
end;
$$;

revoke all on function public.record_drug_check_with_quota(uuid, text, jsonb, text, jsonb, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_drug_check_with_quota(uuid, text, jsonb, text, jsonb, text, text, text)
  to service_role;
