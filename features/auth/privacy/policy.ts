// Uygulamaya özel gizlilik politikası metni.
// NOT: Bu bir taslaktır; yayından önce gözden geçir ve iletişim adresini güncelle.
// Aynı metni App Store Connect'e gireceğin herkese açık gizlilik sayfasında da yayınla.

const SUPPORT_EMAIL = 'menes.clk01@gmail.com';

const TR = `Son güncelleme: Ağustos 2026

AllergyGuard ("Uygulama"), ilaç alerjilerini kaydetmene, yeni ilaçları alerji listenle karşılaştırmana ve ilaç saatlerini hatırlamana yardımcı olur. Gizliliğine önem veriyoruz. Bu politika hangi verileri neden işlediğimizi açıklar.

1) TOPLADIĞIMIZ VERİLER
• Hesap bilgileri: ad-soyad, kullanıcı adı ve e-posta. Profil ayarlarında isteğe bağlı olarak doğum tarihi ekleyebilirsin.
• Sağlıkla ilgili bilgiler: kaydettiğin alerjiler, ilaçlar, etken maddeler, reaksiyon notları, ilaç hatırlatıcıları ve "aldım/atladım" kayıtları.
• Kullanım verileri: yaptığın ilaç kontrolleri ve risk sonuçları.
• Bildirim için gerekli teknik veriler.

2) VERİLERİ NEDEN İŞLİYORUZ
• Hizmeti sunmak (alerji listesi, risk kontrolü, hatırlatıcılar).
• Girdiğin ilacı alerji listenle karşılaştırıp risk sonucunu göstermek.
• Aboneliğini ve premium erişimini yönetmek.

3) YAPAY ZEKÂ HAKKINDA
İlaç analizinde risk kararı; alerji listenle etken madde eşleşmesine göre belirlenir. Sonucu senin dilinde açıklamak için ilaç adı ve etken madde bilgisi yapay zekâ sağlayıcımıza (OpenAI) iletilir. Bu açıklama bilgilendirme amaçlıdır.

4) VERİLERİ PAYLAŞTIĞIMIZ ÜÇÜNCÜ TARAFLAR
• Supabase — veritabanı ve kimlik doğrulama (verilerin güvenli şekilde saklandığı altyapı).
• OpenAI — yalnızca sonucu açıklamak için ilaç/etken madde bilgisi.
• Adapty & Apple — abonelik yönetimi ve ödeme.
• Apple — "Apple ile Giriş" kullanırsan kimlik doğrulama.
Verilerini reklam amacıyla satmayız.

5) TIBBİ UYARI
Bu uygulama bir tıbbi cihaz değildir ve doktor/eczacı tavsiyesinin yerine geçmez. Sağlığınla ilgili kararlarda mutlaka bir sağlık profesyoneline danış. Acil durumlarda 112'yi ara.

6) SAKLAMA VE SİLME
Verilerin hesabın aktif olduğu sürece saklanır. Uygulama içinden hesabını sildiğinde hesabın ve ilişkili verilerin kalıcı olarak silinir.

7) HAKLARIN
Verilerine erişme, düzeltme ve silme hakkına sahipsin. Bunları uygulama içinden ya da bizimle iletişime geçerek kullanabilirsin.

8) GÜVENLİK
Veriler şifreli bağlantı üzerinden iletilir ve satır düzeyinde erişim kurallarıyla (RLS) yalnızca sana ve izin verdiğin kişilere (aile takibi) açık tutulur.

9) AİLE TAKİBİ
Bir davet kodu paylaşırsan, seçtiğin kişi hatırlatıcılarını ve ilaç uyumunu görebilir. Bu bağı istediğin zaman kaldırabilirsin.

10) ÇOCUKLAR
Uygulama 13 yaşından küçükler için tasarlanmamıştır.

11) DEĞİŞİKLİKLER
Bu politikayı zaman zaman güncelleyebiliriz; önemli değişiklikleri uygulama üzerinden bildiririz.

12) İLETİŞİM
Sorularını ${SUPPORT_EMAIL} adresine iletebilirsin.

Kaydolarak bu Gizlilik Politikası'nı okuduğunu ve kabul ettiğini onaylarsın.`;

const EN = `Last updated: August 2026

AllergyGuard ("the App") helps you record drug allergies, compare new medicines against your allergy list, and remember medication times. We care about your privacy. This policy explains what data we process and why.

1) DATA WE COLLECT
• Account info: full name, username, and email. You may optionally add a date of birth in profile settings.
• Health-related info: allergies, medicines, active ingredients, reaction notes, reminders, and taken/skipped logs.
• Usage data: your medicine checks and risk results.
• Technical data required for notifications.

2) WHY WE PROCESS DATA
• To provide the service (allergy list, risk checks, reminders).
• To compare a medicine against your allergy list and show a risk result.
• To manage your subscription and premium access.

3) ABOUT AI
The risk decision is based on ingredient matching against your allergy list. To explain the result in your language, the medicine name and ingredients are sent to our AI provider (OpenAI). This explanation is informational only.

4) THIRD PARTIES
• Supabase — database and authentication.
• OpenAI — medicine/ingredient info only, to explain results.
• Adapty & Apple — subscription management and payments.
• Apple — authentication if you use Sign in with Apple.
We do not sell your data for advertising.

5) MEDICAL DISCLAIMER
This app is not a medical device and does not replace advice from a doctor or pharmacist. Always consult a healthcare professional for health decisions. In emergencies, call your local emergency number.

6) RETENTION & DELETION
Your data is kept while your account is active. Deleting your account in-app permanently removes your account and associated data.

7) YOUR RIGHTS
You can access, correct, and delete your data, in-app or by contacting us.

8) SECURITY
Data is transmitted over encrypted connections and protected with row-level security so it is only visible to you and people you allow (family tracking).

9) FAMILY TRACKING
If you share an invite code, the chosen person can see your reminders and adherence. You can remove this link anytime.

10) CHILDREN
The App is not intended for children under 13.

11) CHANGES
We may update this policy; we will notify you of significant changes in the app.

12) CONTACT
Questions: ${SUPPORT_EMAIL}

By signing up, you confirm that you have read and accepted this Privacy Policy.`;

export function privacyPolicyText(language: 'tr' | 'en'): string {
  return language === 'en' ? EN : TR;
}
