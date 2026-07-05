import { supabase } from './supabase';

export type TrDrugSuggestion = {
  name: string;
  barcode: string | null;
  ingredients: string[];
};

// Türkçe karakterleri sadeleştir (tr_drugs.name_search ile aynı kural)
const TR_CHAR_MAP: Record<string, string> = {
  Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U', Â: 'A', Î: 'I', Û: 'U',
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
};

export function trNormalize(s: string): string {
  return s
    .split('')
    .map((ch) => TR_CHAR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseIngredients(ingredientEn: string | null): string[] {
  const parsed = String(ingredientEn ?? '')
    .split(',')
    .map((s) => s.replace(/combinations?/i, '').trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ingredientEn ? [ingredientEn] : [];
}

// TİTCK listesinde isimle öneri ara (autocomplete)
export async function suggestTrDrugs(term: string, limit = 8): Promise<TrDrugSuggestion[]> {
  const norm = trNormalize(term).replace(/[%_]/g, '');
  if (norm.length < 2) return [];

  const { data, error } = await supabase
    .from('tr_drugs')
    .select('name, barcode, ingredient_en')
    .like('name_search', `${norm}%`)
    .limit(limit);

  if (error || !data) return [];

  // Önekle başlayan az sonuç varsa "içinde geçen" ile tamamla
  let rows = data;
  if (rows.length < limit) {
    const { data: more } = await supabase
      .from('tr_drugs')
      .select('name, barcode, ingredient_en')
      .like('name_search', `%${norm}%`)
      .limit(limit);
    if (more) {
      for (const m of more) {
        if (!rows.some((r) => r.name === m.name)) rows = [...rows, m];
        if (rows.length >= limit) break;
      }
    }
  }

  return rows.map((r) => ({
    name: r.name,
    barcode: r.barcode ?? null,
    ingredients: parseIngredients(r.ingredient_en),
  }));
}
