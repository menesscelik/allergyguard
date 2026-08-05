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

export type AdherenceStats = {
  streak: number;
  adherence: number | null;
  taken: number;
  skipped: number;
};

// Son 90 günün "aldım/atladım" kayıtlarından uyum yüzdesi ve seri hesaplar.
// userId verilirse o kullanıcının kayıtları kullanılır (bakıcı takibi); RLS
// bakıcının sadece bağlı olduğu kişiyi okumasına izin verir.
export async function getAdherenceStats(userId?: string): Promise<AdherenceStats> {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceKey = since.toLocaleDateString('en-CA');

  let query = supabase
    .from('medication_intake_logs')
    .select('status, taken_for_date')
    .gte('taken_for_date', sinceKey);
  if (userId) query = query.eq('user_id', userId);

  const result = await query;

  const logs = (result.data ?? []) as { status: IntakeStatus; taken_for_date: string }[];

  let taken = 0;
  let skipped = 0;
  const byDate = new Map<string, { taken: number; skipped: number }>();
  for (const log of logs) {
    const rec = byDate.get(log.taken_for_date) ?? { taken: 0, skipped: 0 };
    if (log.status === 'taken') {
      rec.taken += 1;
      taken += 1;
    } else {
      rec.skipped += 1;
      skipped += 1;
    }
    byDate.set(log.taken_for_date, rec);
  }

  const total = taken + skipped;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : null;

  // Seri: bugünden geriye, ilaç alınan ve hiç atlanmayan ardışık günler.
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = cursor.toLocaleDateString('en-CA');
    const rec = byDate.get(key);
    if (i === 0 && !rec) {
      // Bugün henüz kayıt yoksa seriyi bozma, dünden saymaya başla.
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (!rec || rec.skipped > 0 || rec.taken === 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { streak, adherence, taken, skipped };
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
