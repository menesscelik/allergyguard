-- Güvenlik: profiles tablosunda ayrıcalıklı kolonların (is_premium, is_admin,
-- premium_until) istemciden yazılmasını engelle.
--
-- Sorun: "profiles_update_own" RLS politikası yalnızca satır sahipliğini kontrol
-- ediyordu; kolon bazında kısıtlama yoktu ve authenticated rolünde bu kolonlarda
-- UPDATE yetkisi açıktı. Bu yüzden herhangi bir kullanıcı doğrudan REST API ile
-- kendi is_premium / is_admin alanını true yapıp ücretsiz premium + admin
-- yetkisi elde edebiliyordu.
--
-- Çözüm: authenticated rolünden tüm UPDATE yetkisini geri al, sadece kullanıcının
-- düzenleyebileceği profil kolonlarında yeniden ver. is_premium/premium_until/
-- is_admin yalnızca SECURITY DEFINER fonksiyonlar (promo, admin) veya service_role
-- (Adapty webhook) tarafından yazılabilir.

revoke update on public.profiles from authenticated;

grant update (full_name, username, birth_date, language, updated_at)
  on public.profiles to authenticated;

-- Not: SECURITY DEFINER fonksiyonlar (redeem_promo_code, admin_* ) fonksiyon
-- sahibinin yetkisiyle çalıştığı için is_premium/is_admin yazmaya devam eder.
-- Adapty webhook Edge Function'ı service_role kullandığı için etkilenmez.
