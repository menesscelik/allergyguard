import { supabase } from '@/lib/supabase';
import type { DrugCheck } from '@/lib/types';

export async function getDrugCheck(id: string) {
  const result = await supabase
    .from('drug_checks')
    .select('*')
    .eq('id', id)
    .single();

  return { ...result, data: result.data as DrugCheck | null };
}
