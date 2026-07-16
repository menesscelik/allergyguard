import { supabase } from '@/lib/supabase';
import type { DrugSearchResult } from '@/lib/types';

function currentWeekStart(): string {
  const now = new Date();
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday)
  );
  return monday.toISOString().slice(0, 10);
}

export async function getWeeklyQuota(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userId)
    .single();
  if (profile?.is_premium) return { isPremium: true, checksLeft: null };

  const { data: usage } = await supabase
    .from('weekly_usage')
    .select('check_count')
    .eq('user_id', userId)
    .eq('week_start', currentWeekStart())
    .maybeSingle();
  return { isPremium: false, checksLeft: Math.max(0, 1 - (usage?.check_count ?? 0)) };
}

export async function searchDrugs(query: string) {
  const result = await supabase.functions.invoke('search-drug', { body: { query } });
  return {
    ...result,
    data: (result.data?.results ?? []) as DrugSearchResult[],
  };
}
