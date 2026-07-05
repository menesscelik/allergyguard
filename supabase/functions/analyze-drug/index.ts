// Edge Function: analyze-drug
// Kullanıcının alerji listesiyle test edilen ilacı karşılaştırır:
// haftalık limit kontrolü → OpenAI risk analizi → drug_checks kaydı.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AnalysisResult = {
  risk_level: 'safe' | 'warning' | 'danger';
  matched_ingredients: string[];
  explanation: string;
  recommendation: string;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Bu haftanın Pazartesi tarihi (YYYY-MM-DD) — Postgres date_trunc('week') ile uyumlu
function currentWeekStart(): string {
  const now = new Date();
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  return monday.toISOString().slice(0, 10);
}

function normalize(s: string): string {
  return s.toLocaleLowerCase('tr').trim();
}

async function callOpenAI(
  allergyList: string[],
  drugName: string,
  ingredients: string[],
  precomputedMatches: string[],
  language: string
): Promise<AnalysisResult | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  const systemPrompt =
    'Sen bir ilaç güvenlik asistanısın. Kullanıcının alerjik olduğu etken maddelerle test edilen ilacın ' +
    'etken maddelerini karşılaştırırsın. Tıbbi tavsiye vermezsin; sadece etken madde karşılaştırması yaparsın. ' +
    'Türkçe ve İngilizce ilaç/madde adlarının aynı maddeyi ifade edebileceğini bil (örn. "asetilsalisilik asit" = ' +
    '"acetylsalicylic acid" = "aspirin") ve çapraz reaksiyon riski bilinen madde ailelerini (örn. NSAID\'ler, ' +
    'penisilinler) değerlendir. Emin olamadığın durumda daha temkinli seviyeyi seç. ' +
    'Yanıtını SADECE şu JSON şemasıyla ver: {"risk_level": "safe|warning|danger", ' +
    '"matched_ingredients": ["..."], "explanation": "...", "recommendation": "..."}. ' +
    'explanation ve recommendation alanlarını kullanıcının dilinde yaz.';

  const userPrompt = JSON.stringify({
    user_allergic_ingredients: allergyList,
    tested_drug_name: drugName,
    tested_drug_ingredients: ingredients,
    exact_text_matches: precomputedMatches,
    user_language: language,
  });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      console.error('OpenAI error:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '');
    if (!['safe', 'warning', 'danger'].includes(parsed.risk_level)) return null;
    return {
      risk_level: parsed.risk_level,
      matched_ingredients: Array.isArray(parsed.matched_ingredients) ? parsed.matched_ingredients : [],
      explanation: String(parsed.explanation ?? ''),
      recommendation: String(parsed.recommendation ?? ''),
    };
  } catch (err) {
    console.error('OpenAI call failed:', err);
    return null;
  }
}

// OpenAI erişilemezse kural tabanlı yedek analiz
function fallbackAnalysis(matches: string[], hasIngredientData: boolean, language: string): AnalysisResult {
  const tr = language !== 'en';
  if (matches.length > 0) {
    return {
      risk_level: 'danger',
      matched_ingredients: matches,
      explanation: tr
        ? `Alerji listenle eşleşen madde(ler) bulundu: ${matches.join(', ')}.`
        : `Matched ingredient(s) with your allergy list: ${matches.join(', ')}.`,
      recommendation: tr ? 'Bu ilacı kullanmadan önce mutlaka doktoruna danış.' : 'Consult your doctor before using this drug.',
    };
  }
  if (!hasIngredientData) {
    return {
      risk_level: 'warning',
      matched_ingredients: [],
      explanation: tr
        ? 'İlacın etken maddeleri doğrulanamadı, karşılaştırma eksik olabilir.'
        : 'Active ingredients could not be verified; comparison may be incomplete.',
      recommendation: tr ? 'Prospektüsü kontrol et ve doktoruna danış.' : 'Check the leaflet and consult your doctor.',
    };
  }
  return {
    risk_level: 'safe',
    matched_ingredients: [],
    explanation: tr
      ? 'Alerji listenle bilinen bir etken madde eşleşmesi bulunamadı.'
      : 'No known ingredient match with your allergy list.',
    recommendation: tr
      ? 'Yine de ilk kullanımda dikkatli ol; şüphen varsa doktoruna danış.'
      : 'Still be careful on first use; consult your doctor if in doubt.',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Kullanıcıyı doğrula (istemciden gelen JWT ile)
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return json({ error: 'unauthorized', message: 'Oturum bulunamadı.' }, 401);
    }

    // Sistem işlemleri için service role (RLS bypass)
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const drugName: string = String(body.drugName ?? '').trim();
    const ingredients: string[] = Array.isArray(body.ingredients)
      ? body.ingredients.map((i: unknown) => String(i)).filter(Boolean)
      : [];
    const rxcui: string | null = body.rxcui ? String(body.rxcui) : null;
    const language: string = body.language === 'en' ? 'en' : 'tr';

    if (!drugName) {
      return json({ error: 'invalid_input', message: 'İlaç adı gerekli.' }, 400);
    }

    // Haftalık limit kontrolü
    const { data: profile } = await admin
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();
    const weekStart = currentWeekStart();
    const { data: usage } = await admin
      .from('weekly_usage')
      .select('id, check_count')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle();
    const used = usage?.check_count ?? 0;

    if (!profile?.is_premium && used >= 1) {
      return json(
        {
          error: 'weekly_limit',
          message: 'Bu haftaki ücretsiz test hakkın doldu. Hakkın Pazartesi yenilenir.',
        },
        429
      );
    }

    // Kullanıcının alerjileri
    const { data: allergies } = await admin
      .from('allergies')
      .select('drug_name, active_ingredients')
      .eq('user_id', user.id);

    const allergySet = new Set<string>();
    for (const a of allergies ?? []) {
      if (a.drug_name) allergySet.add(a.drug_name);
      for (const ing of (a.active_ingredients as string[]) ?? []) allergySet.add(ing);
    }
    const allergyList = [...allergySet];

    // Birebir metin eşleşmeleri (AI'ya ipucu + yedek analiz için)
    const testedSet = new Set([drugName, ...ingredients].map(normalize));
    const exactMatches = allergyList.filter((a) => testedSet.has(normalize(a)));

    // AI analizi; başarısız olursa kural tabanlı yedek
    let result = await callOpenAI(allergyList, drugName, ingredients, exactMatches, language);
    let usedFallback = false;
    if (!result) {
      result = fallbackAnalysis(exactMatches, ingredients.length > 0, language);
      usedFallback = true;
    }

    // GÜVENLİK KİLİDİ: kod birebir eşleşme bulduysa sonuç asla 'safe' olamaz.
    // AI yanılsa bile deterministik eşleşme her zaman 'danger'a çeker.
    if (exactMatches.length > 0 && result.risk_level !== 'danger') {
      result.risk_level = 'danger';
      result.matched_ingredients = [...new Set([...result.matched_ingredients, ...exactMatches])];
      result.recommendation =
        language === 'en'
          ? 'Do not use this drug before consulting your doctor.'
          : 'Doktoruna danışmadan bu ilacı kullanma.';
    }
    // Tutarlılık: AI eşleşme listelediyse ama 'safe' dediyse en az 'warning'e çek
    if (result.risk_level === 'safe' && result.matched_ingredients.length > 0) {
      result.risk_level = 'warning';
    }

    // Sonucu kaydet
    await admin.from('drug_checks').insert({
      user_id: user.id,
      tested_drug_name: drugName,
      tested_ingredients: ingredients,
      risk_level: result.risk_level,
      matched_ingredients: result.matched_ingredients,
      ai_explanation: result.explanation,
      ai_recommendation: result.recommendation,
      language,
    });

    // Haftalık kullanımı artır
    if (usage) {
      await admin
        .from('weekly_usage')
        .update({ check_count: used + 1 })
        .eq('id', usage.id);
    } else {
      await admin
        .from('weekly_usage')
        .insert({ user_id: user.id, week_start: weekStart, check_count: 1 });
    }

    return json({
      ...result,
      tested_drug_name: drugName,
      tested_ingredients: ingredients,
      rxcui,
      used_fallback: usedFallback,
      remaining_checks: profile?.is_premium ? null : 0,
    });
  } catch (err) {
    console.error('analyze-drug error:', err);
    return json({ error: 'internal', message: 'Analiz sırasında bir hata oluştu.' }, 500);
  }
});
