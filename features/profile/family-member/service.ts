import { getAdherenceStats, type AdherenceStats } from '@/features/reminders/reminder-list/service';
import { supabase } from '@/lib/supabase';
import type { Reminder } from '@/lib/types';

export async function getMemberReminders(userId: string): Promise<Reminder[]> {
  const result = await supabase
    .from('medication_reminders')
    .select('*')
    .eq('user_id', userId)
    .order('remind_time', { ascending: true });
  return (result.data ?? []) as Reminder[];
}

export async function getMemberStats(userId: string): Promise<AdherenceStats> {
  return getAdherenceStats(userId);
}

export type { AdherenceStats };
