import { supabase } from '@/lib/supabase';
import type { Allergy } from '@/lib/types';

export async function listAllergies() {
  const result = await supabase
    .from('allergies')
    .select('*')
    .order('created_at', { ascending: false });
  return { ...result, data: result.data as Allergy[] | null };
}

export function deleteAllergy(id: string) {
  return supabase.from('allergies').delete().eq('id', id);
}

export async function getTodaySummary() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [checks, risky, reminders] = await Promise.all([
    supabase.from('drug_checks').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString()),
    supabase
      .from('drug_checks')
      .select('id', { count: 'exact', head: true })
      .eq('risk_level', 'danger')
      .gte('created_at', since.toISOString()),
    supabase.from('medication_reminders').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  return {
    checksToday: checks.count ?? 0,
    riskyToday: risky.count ?? 0,
    activeReminders: reminders.count ?? 0,
  };
}
