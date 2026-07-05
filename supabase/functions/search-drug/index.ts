// Edge Function: search-drug
// Arama sırası: tr_drugs (TİTCK listesi) → RxNorm → OpenFDA → AI çevirisi (RxNorm doğrulamalı)

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DrugResult = {
  rxcui: string | null;
  name: string;
  ingredients: string[];
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function fetchJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// RxNorm: yaklaşık isim eşleşmesi → rxcui adayları
async function searchRxNorm(term: string): Promise<DrugResult[]> {
  const approx = await fetchJson(
    `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=10`
  );
  const candidates: any[] = approx?.approximateGroup?.candidate ?? [];

  const rxcuis: string[] = [];
  for (const c of candidates) {
    if (c.rxcui && !rxcuis.includes(c.rxcui)) rxcuis.push(c.rxcui);
    if (rxcuis.length >= 5) break;
  }

  const results: DrugResult[] = [];
  for (const rxcui of rxcuis) {
    const [prop, related] = await Promise.all([
      fetchJson(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/property.json?propName=RxNorm%20Name`),
      fetchJson(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN`),
    ]);

    const name: string | undefined = prop?.propConceptGroup?.propConcept?.[0]?.propValue;
    if (!name) continue;

    const groups: any[] = related?.relatedGroup?.conceptGroup ?? [];
    const ingredients: string[] = [];
    for (const g of groups) {
      for (const cp of g.conceptProperties ?? []) {
        if (cp.name && !ingredients.includes(cp.name)) ingredients.push(cp.name);
      }
    }

    // Aday zaten bir etken maddeyse kendisi de listeye girsin
    if (ingredients.length === 0) ingredients.push(name);

    // Aynı isim tekrar gelmesin
    if (!results.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      results.push({ rxcui, name, ingredients });
    }
  }
  return results;
}

// OpenFDA: marka adıyla etiket arama (RxNorm fallback'i)
async function searchOpenFda(term: string): Promise<DrugResult[]> {
  const q = encodeURIComponent(`openfda.brand_name:"${term}"`);
  const data = await fetchJson(`https://api.fda.gov/drug/label.json?search=${q}&limit=5`);
  const results: DrugResult[] = [];
  for (const item of data?.results ?? []) {
    const brand = item?.openfda?.brand_name?.[0];
    const substances: string[] = item?.openfda?.substance_name ?? item?.openfda?.generic_name ?? [];
    if (!brand) continue;
    if (!results.some((r) => r.name.toLowerCase() === brand.toLowerCase())) {
      results.push({
        rxcui: item?.openfda?.rxcui?.[0] ?? null,
        name: brand,
        ingredients: [...new Set(substances)],
      });
    }
  }
  return results;
}

// Türkçe karakterleri sadeleştir (tr_drugs.name_search ile aynı kural)
const TR_CHAR_MAP: Record<string, string> = {
  Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U', Â: 'A', Î: 'I', Û: 'U',
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
};
function trNormalize(s: string): string {
  return s
    .split('')
    .map((ch) => TR_CHAR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// TİTCK Türkiye ilaç listesinde ara
async function searchTrDrugs(term: string): Promise<DrugResult[]> {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const norm = trNormalize(term).replace(/[%_]/g, '');
  if (norm.length < 2) return [];

  const { data, error } = await admin
    .from('tr_drugs')
    .select('name, barcode, ingredient_en')
    .like('name_search', `%${norm}%`)
    .limit(10);

  if (error || !data) return [];

  const results: DrugResult[] = [];
  for (const row of data) {
    const ingredients = String(row.ingredient_en ?? '')
      .split(',')
      .map((s: string) => s.replace(/combinations?/i, '').trim())
      .filter(Boolean);
    results.push({
      rxcui: null,
      name: row.name,
      ingredients: ingredients.length > 0 ? ingredients : [String(row.ingredient_en)],
    });
  }
  return results;
}

// RxNorm'da isimden rxcui bul (AI çıktısını doğrulamak için)
async function rxcuiForName(name: string): Promise<string | null> {
  const data = await fetchJson(
    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}&search=2`
  );
  return data?.idGroup?.rxnormId?.[0] ?? null;
}

// Yerel marka adını (örn. Parol) OpenAI ile uluslararası etken maddeye çevir.
// Uydurma riskine karşı: dönen her madde RxNorm'da doğrulanır, doğrulanamayan atılır.
async function aiBrandLookup(term: string): Promise<DrugResult | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Sana bir ilaç marka adı verilecek (genellikle Türkiye pazarından). ' +
              'Bu ilacın etken maddelerini İngilizce INN adlarıyla döndür. ' +
              'SADECE şu JSON ile yanıt ver: {"found": true|false, ' +
              '"international_name": "birincil etken maddenin İngilizce adı", ' +
              '"ingredients_en": ["...", "..."]}. ' +
              'İlacı kesin olarak tanımıyorsan tahmin ETME, found=false döndür.',
          },
          { role: 'user', content: term },
        ],
      }),
    });
    if (!res.ok) {
      console.error('OpenAI brand lookup error:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '');
    if (!parsed?.found || !Array.isArray(parsed.ingredients_en) || parsed.ingredients_en.length === 0) {
      return null;
    }

    // RxNorm doğrulaması: sadece gerçekten var olan maddeleri tut
    const validated: string[] = [];
    let rxcui: string | null = null;
    for (const ing of parsed.ingredients_en.slice(0, 5)) {
      const id = await rxcuiForName(String(ing));
      if (id) {
        validated.push(String(ing));
        if (!rxcui) rxcui = id;
      }
    }
    if (validated.length === 0) return null;

    const intlName = String(parsed.international_name ?? validated[0]);
    return {
      rxcui,
      name: `${term} (${intlName})`,
      ingredients: validated,
    };
  } catch (err) {
    console.error('aiBrandLookup failed:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (typeof query !== 'string' || query.trim().length < 2) {
      return json({ error: 'invalid_query', message: 'En az 2 karakterlik bir ilaç adı gir.' }, 400);
    }
    const term = query.trim();

    // Önce Türkiye ilaç listesi (marka adları burada)
    let results = await searchTrDrugs(term);
    if (results.length === 0) {
      results = await searchRxNorm(term);
    }
    if (results.length === 0) {
      results = await searchOpenFda(term);
    }
    // Hâlâ boşsa: yerel marka adı olabilir → AI çevirisi + RxNorm doğrulaması
    if (results.length === 0) {
      const aiResult = await aiBrandLookup(term);
      if (aiResult) results = [aiResult];
    }

    return json({ results });
  } catch (err) {
    console.error('search-drug error:', err);
    return json({ error: 'internal', message: 'Arama sırasında bir hata oluştu.' }, 500);
  }
});
