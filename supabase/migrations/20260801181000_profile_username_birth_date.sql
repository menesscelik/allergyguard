alter table public.profiles
  add column if not exists username text,
  add column if not exists birth_date date;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.handle_new_user() returns trigger as $$
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
