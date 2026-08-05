// Adapty -> Supabase premium senkronizasyonu.
//
// Adapty Dashboard'da Integrations -> Webhook olarak bu fonksiyonun URL'i tanımlanır
// ve "Authorization" başlığına ADAPTY_WEBHOOK_SECRET ile aynı değer girilir.
// customer_user_id, uygulamada activateAdapty(customerUserId=userId) ile Supabase
// kullanıcı id'sine eşitlendiği için burada doğrudan profiles.id olarak kullanılır.
//
// is_premium / premium_until yalnızca burada (service_role ile) yazılır; istemci
// yazamaz (bkz. 20260804120000_lock_profile_privileged_columns.sql).

import { createClient } from 'npm:@supabase/supabase-js@2';

const PREMIUM_ACCESS_LEVEL = 'premium';

// Bu event'ler premium'u KALDIRIR. Diğer premium-access event'leri premium VERİR.
// (cancel = otomatik yenileme kapalı ama süre bitene kadar aktif → kaldırma değil.)
const REVOKING_EVENTS = new Set([
  'subscription_expired',
  'subscription_refunded',
  'access_level_revoked',
]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Paylaşılan sır doğrulaması
  const secret = Deno.env.get('ADAPTY_WEBHOOK_SECRET');
  const provided = req.headers.get('authorization') ?? '';
  if (!secret || provided !== secret) {
    return json({ error: 'unauthorized' }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const eventType = String(payload.event_type ?? '');
  const props = (payload.event_properties ?? {}) as Record<string, unknown>;
  const profile = (payload.profile ?? {}) as Record<string, unknown>;

  const customerUserId = String(
    payload.customer_user_id ?? props.customer_user_id ?? profile.customer_user_id ?? ''
  );
  if (!customerUserId) {
    // Kullanıcıyı eşleştiremiyorsak sessizce kabul et (retry döngüsü olmasın).
    return json({ ok: true, skipped: 'no_customer_user_id' });
  }

  const accessLevelId = String(props.access_level_id ?? props.access_level ?? '');
  // Bu event premium erişim seviyesiyle ilgili değilse yok say.
  if (accessLevelId && accessLevelId !== PREMIUM_ACCESS_LEVEL) {
    return json({ ok: true, skipped: 'other_access_level' });
  }

  const expiresAtRaw = props.expires_at ?? props.expiration_date ?? null;
  const expiresAt = expiresAtRaw ? new Date(String(expiresAtRaw)) : null;
  const expiredByDate = expiresAt ? expiresAt.getTime() <= Date.now() : false;

  const isPremium = !REVOKING_EVENTS.has(eventType) && !expiredByDate;

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { error } = await admin
    .from('profiles')
    .update({
      is_premium: isPremium,
      premium_until: isPremium && expiresAt ? expiresAt.toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerUserId);

  if (error) {
    console.error('adapty-webhook update error:', error, { customerUserId, eventType });
    return json({ error: 'update_failed' }, 500);
  }

  return json({ ok: true, is_premium: isPremium });
});
