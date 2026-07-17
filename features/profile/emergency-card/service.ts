import { supabase } from '@/lib/supabase';
import type { Allergy, Profile } from '@/lib/types';

export async function getEmergencyCardData(userId: string) {
  const [profile, allergies] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('allergies').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  return {
    profile: profile.data as Profile | null,
    allergies: (allergies.data ?? []) as Allergy[],
    error: profile.error ?? allergies.error,
  };
}
