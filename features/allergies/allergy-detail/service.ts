import { supabase } from '@/lib/supabase';
import type { Allergy, DrugCheck } from '@/lib/types';

export async function getAllergy(id: string) {
  const result = await supabase
    .from('allergies')
    .select('*')
    .eq('id', id)
    .single();

  return { ...result, data: result.data as Allergy | null };
}

export async function getRecentChecksForAllergy(allergy: Allergy) {
  const terms = [allergy.drug_name, ...allergy.active_ingredients].filter(Boolean);
  if (terms.length === 0) return { data: [] as DrugCheck[], error: null };

  const result = await supabase
    .from('drug_checks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  const normalizedTerms = terms.map((term) => term.toLocaleLowerCase('tr'));
  const filtered = ((result.data ?? []) as DrugCheck[]).filter((check) => {
    const haystack = [
      check.tested_drug_name,
      ...check.tested_ingredients,
      ...check.matched_ingredients,
    ].join(' ').toLocaleLowerCase('tr');
    return normalizedTerms.some((term) => haystack.includes(term));
  });

  return { ...result, data: filtered };
}

export function deleteAllergy(id: string) {
  return supabase.from('allergies').delete().eq('id', id);
}
