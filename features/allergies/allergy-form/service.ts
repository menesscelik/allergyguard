import { suggestTrDrugs } from '@/lib/drugs';
import { supabase } from '@/lib/supabase';
import type { Severity } from '@/lib/types';

export { suggestTrDrugs };

export function getAllergy(id: string) {
  return supabase.from('allergies').select('*').eq('id', id).single();
}

type AllergyPayload = {
  drug_name: string;
  reaction_notes: string | null;
  severity: Severity;
  active_ingredients?: string[];
  barcode?: string | null;
};

export function saveAllergy(id: string | undefined, userId: string, payload: AllergyPayload) {
  return id
    ? supabase.from('allergies').update(payload).eq('id', id)
    : supabase.from('allergies').insert({ ...payload, user_id: userId });
}
