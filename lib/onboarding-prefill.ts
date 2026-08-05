import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

const PENDING_KEY = 'onboarding_pending_allergies_v1';

// Onboarding'de seçilen alerjileri (giriş öncesi) cihazda sakla.
export async function savePendingAllergies(names: string[]) {
  if (!names.length) return;
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(names));
}

// Giriş sonrası: bekleyen alerjileri kullanıcının listesine ekle, anahtarı temizle.
// Bir kez çalışır; eklenen kayıt sayısını döndürür.
export async function applyPendingAllergies(userId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  if (!raw) return 0;

  let names: string[] = [];
  try {
    names = JSON.parse(raw);
  } catch {
    names = [];
  }

  // Ne olursa olsun anahtarı temizle (tekrar denenmesin).
  await AsyncStorage.removeItem(PENDING_KEY);
  if (!names.length) return 0;

  const rows = names.map((name) => ({
    user_id: userId,
    drug_name: name,
    reaction_notes: null,
    severity: 'unknown' as const,
    active_ingredients: [] as string[],
  }));

  const { error } = await supabase.from('allergies').insert(rows);
  return error ? 0 : rows.length;
}
