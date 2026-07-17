import { syncAllNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { IntakeStatus, MedicationIntakeLog, Reminder } from '@/lib/types';

function todayKey() {
  return new Date().toLocaleDateString('en-CA');
}

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

export async function listTodayIntakeLogs() {
  const result = await supabase
    .from('medication_intake_logs')
    .select('*')
    .eq('taken_for_date', todayKey());

  return { ...result, data: result.data as MedicationIntakeLog[] | null };
}

export async function markReminderIntake(reminderId: string, status: IntakeStatus) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;

  if (!userId) {
    return { error: new Error('User session was not found.') };
  }

  return supabase
    .from('medication_intake_logs')
    .upsert(
      {
        user_id: userId,
        reminder_id: reminderId,
        status,
        taken_for_date: todayKey(),
      },
      { onConflict: 'user_id,reminder_id,taken_for_date' }
    )
    .select()
    .single();
}
