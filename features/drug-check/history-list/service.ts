import { supabase } from '@/lib/supabase';
import type { DrugCheck } from '@/lib/types';

export async function listDrugChecks() {
  const result = await supabase
    .from('drug_checks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80);

  return { ...result, data: result.data as DrugCheck[] | null };
}
