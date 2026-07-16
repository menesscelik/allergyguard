import { supabase } from '@/lib/supabase';
import type { AppLanguage } from '@/lib/i18n';
import type { AnalysisResult } from '@/lib/types';

export function analyzeDrug(input: {
  drugName: string;
  ingredients: string[];
  rxcui: string | null;
  language: AppLanguage;
}) {
  return supabase.functions.invoke('analyze-drug', { body: input });
}

export async function saveAnalyzedAllergy(input: {
  userId: string;
  drugName: string;
  ingredients: string[];
  rxcui: string | null;
  reactionNotes: string;
}) {
  const { data: existing } = await supabase
    .from('allergies')
    .select('id')
    .eq('user_id', input.userId)
    .ilike('drug_name', input.drugName)
    .limit(1);

  if (existing?.length) return { alreadyExists: true, error: null };

  const { error } = await supabase.from('allergies').insert({
    user_id: input.userId,
    drug_name: input.drugName,
    active_ingredients: input.ingredients,
    rxcui: input.rxcui,
    reaction_notes: input.reactionNotes,
    severity: 'unknown',
  });
  return { alreadyExists: false, error };
}

export function asAnalysisResult(data: unknown) {
  return data as AnalysisResult;
}
