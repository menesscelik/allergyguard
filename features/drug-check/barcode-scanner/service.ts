import { supabase } from '@/lib/supabase';

export type ScannedDrug = {
  name: string;
  barcode: string;
  ingredients: string[];
};

export async function scanBarcode(barcode: string) {
  const result = await supabase.functions.invoke('scan-barcode', { body: { barcode } });
  return { ...result, drug: result.data?.drug as ScannedDrug | undefined, found: !!result.data?.found };
}

export function addScannedAllergy(userId: string, drug: ScannedDrug) {
  return supabase.from('allergies').insert({
    user_id: userId,
    drug_name: drug.name,
    active_ingredients: drug.ingredients,
    barcode: drug.barcode,
    severity: 'unknown',
  });
}
