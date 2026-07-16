import { syncAllNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { Reminder } from '@/lib/types';

export async function listReminders() {
  const result = await supabase
    .from('medication_reminders')
    .select('*')
    .order('remind_time', { ascending: true });
  return { ...result, data: result.data as Reminder[] | null };
}

export async function setReminderActive(id: string, isActive: boolean) {
  const result = await supabase
    .from('medication_reminders')
    .update({ is_active: isActive })
    .eq('id', id);
  if (!result.error) await syncAllNotifications();
  return result;
}

export async function deleteReminder(id: string) {
  const result = await supabase.from('medication_reminders').delete().eq('id', id);
  if (!result.error) await syncAllNotifications();
  return result;
}
