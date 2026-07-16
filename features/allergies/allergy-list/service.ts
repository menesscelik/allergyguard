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
