// AllergyGuard drug analysis
// Deterministic TİTCK/RxNorm ingredient matching decides the risk.
// OpenAI only explains the already-decided result in the user's language.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RiskLevel = 'safe' | 'warning' | 'danger';
type Severity = 'mild' | 'moderate' | 'severe' | 'unknown';
type SupabaseAdmin = ReturnType<typeof createClient>;
type CanonicalIngredient = { name: string; normalized: string; rxcui: string | null };
type CanonicalAllergyIngredient = CanonicalIngredient & { severity: Severity };
type AnalysisResult = {
  risk_level: RiskLevel;
  matched_ingredients: string[];
  severity_alert?: Severity | null;
  explanation: string;
  recommendation: string;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function currentWeekStart(): string {
  const now = new Date();
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  return monday.toISOString().slice(0, 10);
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseIngredients(value: string | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.replace(/combinations?/i, '').trim())
    .filter(Boolean);
}

function normalizeSeverity(value: unknown): Severity {
  return value === 'mild' || value === 'moderate' || value === 'severe' || value === 'unknown'
    ? value
    : 'unknown';
}

function highestSeverity(values: Severity[]): Severity | null {
  if (values.includes('severe')) return 'severe';
  if (values.includes('moderate')) return 'moderate';
  if (values.includes('mild')) return 'mild';
  if (values.includes('unknown')) return 'unknown';
  return null;
}

async function fetchJson(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function rxCuiForIngredient(name: string): Promise<string | null> {
  const data = await fetchJson(
    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}&search=2`
  );
  return data?.idGroup?.rxnormId?.[0] ?? null;
}

async function canonicalizeIngredients(names: string[]): Promise<CanonicalIngredient[]> {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))].slice(0, 30);
  return await Promise.all(
    unique.map(async (name) => ({ name, normalized: normalize(name), rxcui: await rxCuiForIngredient(name) }))
  );
}

async function canonicalizeAllergyIngredients(
  records: Array<{ name: string; severity: Severity }>
): Promise<CanonicalAllergyIngredient[]> {
  return await Promise.all(
    records
      .filter((record) => record.name.trim())
      .slice(0, 60)
      .map(async (record) => ({
        name: record.name,
        normalized: normalize(record.name),
        rxcui: await rxCuiForIngredient(record.name),
        severity: record.severity,
      }))
  );
}

async function ingredientsFromTrDrugs(admin: SupabaseAdmin, drugName: string): Promise<string[]> {
  const { data } = await admin
    .from('tr_drugs')
    .select('ingredient_en')
    .ilike('name', drugName)
    .limit(1)
    .maybeSingle();
  return parseIngredients(data?.ingredient_en ?? null);
}

function fallbackExplanation(
  risk: RiskLevel,
  matches: string[],
  severityAlert: Severity | null,
  language: string
): Pick<AnalysisResult, 'explanation' | 'recommendation'> {
  const tr = language !== 'en';
  if (risk === 'danger') {
    const severeExtra = severityAlert === 'severe'
      ? (tr
        ? ' Kayıtlı reaksiyon şiddetin “şiddetli” olduğu için bu sonucu acil öncelikli değerlendir.'
        : ' Your saved reaction severity is “severe”, so treat this result as high priority.')
      : '';
    return {
      explanation: tr
        ? `Doğrulanmış etken madde eşleşmesi bulundu: ${matches.join(', ')}.`
        : `A verified active-ingredient match was found: ${matches.join(', ')}.`,
      recommendation: tr
        ? `Bu ilacı kullanmadan önce doktoruna veya eczacına danış.${severeExtra}`
        : `Consult your doctor or pharmacist before using this medicine.${severeExtra}`,
    };
  }
  if (risk === 'warning') {
    return {
      explanation: tr
        ? 'Etken madde verisi tam olarak doğrulanamadığı için güvenilir bir karşılaştırma yapılamadı.'
        : 'A reliable comparison could not be completed because ingredient data was not fully verified.',
      recommendation: tr
        ? 'Prospektüsü kontrol et ve ilacı kullanmadan önce bir sağlık uzmanına danış.'
        : 'Check the leaflet and consult a healthcare professional before use.',
    };
  }
  return {
    explanation: tr
      ? 'TİTCK ve RxNorm verileriyle doğrudan bir etken madde eşleşmesi bulunmadı.'
      : 'No direct active-ingredient match was found using TİTCK and RxNorm data.',
    recommendation: tr
      ? 'Bu sonuç tüm alerji ve çapraz reaksiyonları dışlamaz; şüphen varsa doktoruna danış.'
      : 'This does not rule out every allergy or cross-reaction; consult your doctor if unsure.',
  };
}

async function explainWithOpenAI(
  risk: RiskLevel,
  matches: string[],
  testedDrugName: string,
  testedIngredients: string[],
  language: string
): Promise<Pick<AnalysisResult, 'explanation' | 'recommendation'> | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'allergyguard_explanation',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                explanation: { type: 'string' },
                recommendation: { type: 'string' },
              },
              required: ['explanation', 'recommendation'],
              additionalProperties: false,
            },
          },
        },
        messages: [
          {
            role: 'system',
            content:
              'You explain a deterministic medicine ingredient comparison. The risk level and matches are fixed by code. ' +
              'Never change, reinterpret, or add a diagnosis, cross-reaction, ingredient, or risk. Do not give medical advice. ' +
              'Briefly explain the supplied evidence and recommend consulting a doctor or pharmacist. Use the requested language.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              fixed_risk_level: risk,
              verified_matches: matches,
              tested_drug_name: testedDrugName,
              verified_tested_ingredients: testedIngredients,
              language,
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '');
    return {
      explanation: String(parsed.explanation),
      recommendation: String(parsed.recommendation),
    };
  } catch (error) {
    console.error('OpenAI explanation failed:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'unauthorized', message: 'Oturum bulunamadı.' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const body = await req.json();
    const drugName = String(body.drugName ?? '').trim();
    const suppliedIngredients = Array.isArray(body.ingredients)
      ? body.ingredients.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];
    const rxcui = body.rxcui ? String(body.rxcui) : null;
    const language = body.language === 'en' ? 'en' : 'tr';
    if (!drugName) return json({ error: 'invalid_input', message: 'İlaç adı gerekli.' }, 400);

    // Fast non-authoritative quota check. The RPC below is the final atomic gate.
    const [{ data: profile }, { data: usage }] = await Promise.all([
      admin.from('profiles').select('is_premium').eq('id', user.id).single(),
      admin.from('weekly_usage').select('check_count').eq('user_id', user.id)
        .eq('week_start', currentWeekStart()).maybeSingle(),
    ]);
    if (!profile?.is_premium && (usage?.check_count ?? 0) >= 1) {
      return json({
        error: 'weekly_limit',
        message: language === 'en'
          ? 'Your free check for this week has been used. It renews Monday.'
          : 'Bu haftaki ücretsiz test hakkın doldu. Hakkın Pazartesi yenilenir.',
      }, 429);
    }

    let testedIngredientNames = suppliedIngredients;
    const evidenceSources = new Set<string>();
    if (testedIngredientNames.length > 0) evidenceSources.add(rxcui ? 'RxNorm' : 'TİTCK');
    if (testedIngredientNames.length === 0) {
      testedIngredientNames = await ingredientsFromTrDrugs(admin, drugName);
      if (testedIngredientNames.length > 0) evidenceSources.add('TİTCK');
    }
    const testedIngredients = await canonicalizeIngredients(testedIngredientNames);
    if (testedIngredients.some((item) => item.rxcui)) evidenceSources.add('RxNorm');

    const { data: allergies } = await admin
      .from('allergies')
      .select('drug_name, active_ingredients, severity')
      .eq('user_id', user.id);

    const allergyRecords: Array<{ name: string; severity: Severity }> = [];
    let unresolvedAllergy = false;
    for (const allergy of allergies ?? []) {
      let names = Array.isArray(allergy.active_ingredients)
        ? (allergy.active_ingredients as unknown[]).map(String).filter(Boolean)
        : [];
      if (names.length === 0) names = await ingredientsFromTrDrugs(admin, String(allergy.drug_name));
      if (names.length === 0) unresolvedAllergy = true;
      const severity = normalizeSeverity(allergy.severity);
      allergyRecords.push(...names.map((name) => ({ name, severity })));
    }
    const allergyIngredients = await canonicalizeAllergyIngredients(allergyRecords);
    if (allergyIngredients.some((item) => item.rxcui)) evidenceSources.add('RxNorm');

    const allergySeverityByKey = new Map<string, Severity>();
    for (const item of allergyIngredients) {
      allergySeverityByKey.set(item.normalized, item.severity);
      if (item.rxcui) allergySeverityByKey.set(`rxcui:${item.rxcui}`, item.severity);
    }
    const matchedSeverities: Severity[] = [];
    const matches = testedIngredients.flatMap((item) => {
      const severity =
        allergySeverityByKey.get(item.normalized) ??
        (item.rxcui ? allergySeverityByKey.get(`rxcui:${item.rxcui}`) : undefined);
      if (!severity) return [];
      matchedSeverities.push(severity);
      return [item.name];
    });
    const severityAlert = highestSeverity(matchedSeverities);

    const risk: RiskLevel = matches.length > 0
      ? 'danger'
      : testedIngredients.length === 0 || unresolvedAllergy
        ? 'warning'
        : 'safe';
    const fallback = fallbackExplanation(risk, matches, severityAlert, language);
    const aiExplanation = await explainWithOpenAI(
      risk, matches, drugName, testedIngredients.map((item) => item.name), language
    );
    const severityRecommendation = severityAlert === 'severe'
      ? (language === 'en'
        ? ' Your saved allergy severity is marked severe; seek professional guidance urgently.'
        : ' Kayıtlı alerji şiddetin “şiddetli”; profesyonel destek almayı geciktirme.')
      : '';
    const explanation = aiExplanation
      ? { ...aiExplanation, recommendation: `${aiExplanation.recommendation}${severityRecommendation}` }
      : fallback;

    const { data: recorded, error: recordError } = await admin.rpc('record_drug_check_with_quota', {
      p_user_id: user.id,
      p_tested_drug_name: drugName,
      p_tested_ingredients: testedIngredients.map((item) => item.name),
      p_risk_level: risk,
      p_matched_ingredients: matches,
      p_explanation: explanation.explanation,
      p_recommendation: explanation.recommendation,
      p_language: language,
    });
    if (recordError) {
      console.error('record_drug_check_with_quota error:', recordError);
      return json({ error: 'record_failed', message: 'Analiz kaydedilemedi.' }, 500);
    }
    if (!recorded?.allowed) {
      return json({ error: 'weekly_limit', message: language === 'en'
        ? 'Your free check for this week has been used. It renews Monday.'
        : 'Bu haftaki ücretsiz test hakkın doldu. Hakkın Pazartesi yenilenir.' }, 429);
    }

    return json({
      risk_level: risk,
      matched_ingredients: matches,
      severity_alert: severityAlert,
      explanation: explanation.explanation,
      recommendation: explanation.recommendation,
      tested_drug_name: drugName,
      tested_ingredients: testedIngredients.map((item) => item.name),
      rxcui,
      used_fallback: !aiExplanation,
      evidence_sources: [...evidenceSources],
      analysis_method: 'deterministic_ingredient_match_v2',
      remaining_checks: recorded.remaining_checks,
    });
  } catch (error) {
    console.error('analyze-drug error:', error);
    return json({ error: 'internal', message: 'Analiz sırasında bir hata oluştu.' }, 500);
  }
});
