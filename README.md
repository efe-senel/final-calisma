# Özel final planı

Bu ZIP içindeki dosyaları GitHub Pages kaynak klasörüne koy.
Ayrı verilen Efe_Final_Plani_Ozel_Kurulum.sql dosyası çalışma planının içeriğini taşır.
Bu SQL dosyasını veya eski kişisel HTML dosyasını GitHub'a ekleme.

1. Supabase'de bu uygulamaya ayrılmış projede Email/Password girişini aç.
   Authentication > Users bölümünde kendi hesabını oluştur ve User UID değerini kopyala.
   Herkese açık kayıt açma. Parolanı kendin belirle.
2. Özel SQL dosyasında BURAYA_KENDI_AUTH_USER_UUID değerini kendi UID'nle değiştir.
   SQL Editor'da çalıştır.
3. config.js'e Project URL ve sb_publishable_ ile başlayan Publishable key değerini yaz.
   Secret ve service_role anahtarları kullanma.
4. GitHub Pages'te siteyi aç. Gizli pencerede giriş ekranını doğrula, kendi hesabınla gir,
   bir kutuyu işaretle ve yeniden giriş yaparak kayıt kaldı mı kontrol et.

Oturum sayfa yenilendiğinde kapanır. Kaydedildi mesajı gösterilen görevler ve tarihler
hesabında kalır. Bu sürüm önceki yerel tarayıcı işaretlerini otomatik taşımaz.
