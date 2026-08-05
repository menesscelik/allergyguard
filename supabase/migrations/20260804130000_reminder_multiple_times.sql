-- Hatırlatıcılara günde birden fazla saat desteği.
-- remind_time (tek saat) korunuyor (NOT NULL + geri uyumluluk için ilk saat orada
-- tutulur); yeni remind_times dizisi tüm saatleri "HH:MM:SS" olarak taşır.

alter table public.medication_reminders
  add column if not exists remind_times jsonb not null default '[]'::jsonb;

-- Mevcut kayıtları tek saatten diziye taşı.
update public.medication_reminders
  set remind_times = jsonb_build_array(to_char(remind_time, 'HH24:MI:SS'))
  where remind_times = '[]'::jsonb and remind_time is not null;
