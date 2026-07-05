// Ücretsiz (Personal Team) Apple hesapları Push Notifications yetkisini desteklemiyor.
// expo-notifications eklentisinin eklediği aps-environment'ı prebuild sırasında kaldırır.
// Sadece yerel bildirim kullandığımız için bu yetkiye ihtiyaç yok.
// Apple Developer hesabı alınınca bu plugin app.json'dan çıkarılabilir.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });
};
