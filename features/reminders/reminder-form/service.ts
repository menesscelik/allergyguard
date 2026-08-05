import { ensurePermission, syncAllNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

export function getReminder(id: string) {
  return supabase.from('medication_reminders').select('*').eq('id', id).single();
}

type ReminderPayload = {
  drug_name: string;
  remind_time: string;
  remind_times: string[];
  repeat_days: number[];
  notes: string | null;
  is_active: boolean;
};

export async function saveReminder(
  id: string | undefined,
  userId: string,
  payload: ReminderPayload
) {
  const result = id
    ? await supabase.from('medication_reminders').update(payload).eq('id', id)
    : await supabase.from('medication_reminders').insert({ ...payload, user_id: userId });

  if (result.error) return { ...result, notificationPermissionGranted: false };

  const notificationPermissionGranted = await ensurePermission(true);
  await syncAllNotifications();
  return { ...result, notificationPermissionGranted };
}
