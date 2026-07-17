create table if not exists public.medication_intake_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reminder_id uuid not null references public.medication_reminders(id) on delete cascade,
  status text not null check (status in ('taken', 'skipped')),
  taken_for_date date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, reminder_id, taken_for_date)
);

alter table public.medication_intake_logs enable row level security;

create policy "Users can manage own intake logs"
on public.medication_intake_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists medication_intake_logs_user_date_idx
on public.medication_intake_logs(user_id, taken_for_date desc);

create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('drug_not_found', 'wrong_info', 'general')),
  drug_name text,
  barcode text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.feedback_reports enable row level security;

create policy "Users can create own feedback"
on public.feedback_reports
for insert
with check (auth.uid() = user_id);

create policy "Users can read own feedback"
on public.feedback_reports
for select
using (auth.uid() = user_id);

create index if not exists feedback_reports_user_created_idx
on public.feedback_reports(user_id, created_at desc);
