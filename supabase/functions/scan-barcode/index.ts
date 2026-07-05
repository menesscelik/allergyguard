// Edge Function: scan-barcode
// Barkodu TİTCK listesinde (tr_drugs) arar, ilaç adı + etken maddeleri döndürür.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    const code = String(barcode ?? '').replace(/\D/g, '');
    if (code.length < 8) {
      return json({ error: 'invalid_barcode', message: 'Geçersiz barkod.' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await admin
      .from('tr_drugs')
      .select('name, barcode, atc_code, ingredient_en')
      .eq('barcode', code)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('scan-barcode db error:', error);
      return json({ error: 'internal', message: 'Sorgu sırasında hata oluştu.' }, 500);
    }
    if (!data) {
      return json({ found: false });
    }

    const ingredients = String(data.ingredient_en ?? '')
      .split(',')
      .map((s: string) => s.replace(/combinations?/i, '').trim())
      .filter(Boolean);

    return json({
      found: true,
      drug: {
        name: data.name,
        barcode: data.barcode,
        atc_code: data.atc_code,
        ingredients: ingredients.length > 0 ? ingredients : [String(data.ingredient_en)],
      },
    });
  } catch (err) {
    console.error('scan-barcode error:', err);
    return json({ error: 'internal', message: 'Barkod sorgulanamadı.' }, 500);
  }
});
