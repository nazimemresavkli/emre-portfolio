# Kurulum rehberi

> **Güncel kurulum ve yeni yönetim paneli için `admin/README.md` dosyasına bak.** Bu dosya eski tek dosyalık paneli (`admin-legacy.html`) ve `supabase/setup.sql` akışını anlatır.

Site, Supabase bağlanmadan da çalışır: içerik `content.js` dosyasından gelir ve `/admin` paneli demo modunda açılır. Aşağıdaki adımlar paneli gerçek hâle getirir; yaptığın değişiklikler kaydettiğin anda herkese açık sitede görünür.

## 1. Siteyi Vercel'de yayınla

En iyi yol GitHub üzerinden: klasörü bir GitHub deposuna yükle, Vercel'de **Add New → Project** ile bu depoyu seç ve **Deploy**'a bas. Bundan sonra depoya her değişiklik gönderdiğinde site kendiliğinden güncellenir.

Hızlı yol: klasörün içinde `npx vercel --prod` komutunu çalıştır.

## 2. Supabase projesi oluştur

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje aç (ücretsiz plan yeterli).
2. **Authentication → Users → Add user → Create new user**: e-postan (`nazimemresavkli@gmail.com`) ve güçlü bir şifre gir, **Auto Confirm User** seçeneğini açık bırak.
3. **Authentication → Sign In / Providers** altında **Allow new users to sign up** seçeneğini kapat. Böylece başka kimse hesap açamaz.
4. **SQL Editor**'ı aç, `supabase/setup.sql` dosyasının tamamını yapıştırıp **Run**'a bas. Bu adım tabloları, güvenlik kurallarını ve görsel depolama alanını kurar, ayrıca seni yönetici yapar.

## 3. Siteyi Supabase'e bağla

**Project Settings → API** sayfasından iki değeri kopyala ve `config.js` dosyasına yapıştır:

```js
window.SITE_CONFIG = {
  supabaseUrl: "https://xxxxxxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOi...",   // "anon public" anahtarı
  siteUrl: "https://alan-adin.com"
};
```

`anon` anahtarı herkese açık olacak şekilde tasarlanmıştır; veriyi yalnızca senin değiştirebilmeni veritabanı kuralları sağlar. `service_role` anahtarını asla bu dosyaya koyma.

Değişikliği yayınla (GitHub'a gönder ya da `npx vercel --prod`).

## 4. Panele gir

`alan-adin.com/admin` adresine git, e-postan ve şifrenle giriş yap. İlk kaydettiğinde içerik Supabase'e yazılır; o andan itibaren site içeriği panelden gelir.

Panelde neler var:

- **Durum:** Müsait, Sınırlı ya da Meşgul. Meşgulken ne zaman müsait olacağını yazabilirsin.
- **Projeler:** Ekle, düzenle, sırala, gizle, sil. Ekran görüntüsü yükle; yatay görseller tarayıcı, dikey görseller telefon çerçevesine yerleşir. Kullandığın teknolojileri işaretle; sitedeki katman haritası buna göre güncellenir.
- **Metinler:** Giriş, Hakkımda ve İletişim metinleri, Türkçe ve İngilizce.
- **Ayarlar:** E-posta, LinkedIn ve proje formu anahtarı.

## 5. Proje formunu e-postana bağla

1. [web3forms.com](https://web3forms.com) adresine e-postanı yaz; erişim anahtarı e-postana gelir.
2. Panelde **Ayarlar → Proje formu** alanına yapıştır ve kaydet.

Anahtar girilmediğinde form yine çalışır: ziyaretçinin e-posta uygulamasını, doldurduğu bilgilerle hazır bir mesaj olarak açar.

## 6. SEO ve GEO için son dokunuşlar

`sitemap.xml` ve `llms.txt` dosyalarındaki `https://alan-adin.com` yazan yerleri gerçek adresinle değiştir. Ardından:

- [Google Search Console](https://search.google.com/search-console)'a siteni ekle ve `sitemap.xml` adresini gönder.
- [Bing Webmaster Tools](https://www.bing.com/webmasters)'a da ekle; ChatGPT'nin arama özelliği Bing dizinini de kullanır.

Sitede zaten olanlar: yapılandırılmış veri (Schema.org Person ve ProfessionalService), açıklama ve paylaşım etiketleri, yapay zekâ asistanları için `llms.txt` ve `/admin` sayfasının arama motorlarından gizlenmesi.
