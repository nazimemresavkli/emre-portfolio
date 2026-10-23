# Yönetim paneli (`/admin`)

Sitenin tüm içeriğini kod yazmadan yönettiğin panel: projeler, metinler, görseller, iletişim mesajları ve site ayarları. Panelde kaydettiğin her şey Supabase'e yazılır ve herkese açık site aynı veriyi okur.

- **Canlı mod:** `config.js` içinde Supabase adresi ve anon anahtarı varsa panel giriş ister ve gerçek veriyle çalışır.
- **Demo modu:** `config.js` boşsa panel girişsiz açılır, veriyi yalnızca o tarayıcıda (localStorage) tutar. Bu sırada site de aynı tarayıcıda demo verisini önizler.

Eski tek dosyalık panel `admin-legacy.html` olarak duruyor (yedek; ileride silinebilir).

---

## Klasör yapısı

```
admin/
  index.html                 Panel kabuğu: /config.js, /content.js ve /vendor/supabase.js'i yükler, sonra js/app.js
  styles/admin.css           Tasarım değişkenleri (açık/koyu), yerleşim ve bileşen stilleri
  js/
    app.js                   Açılış: adapter seçimi, oturum/yetki kontrolü, kabuk, sayfa yükleme
    router.js                Hash router (#/projects/lara); her statik sunucuda çalışır
    state.js                 Küçük ortak durum (kullanıcı, mod, ayarlar, yeni mesaj sayısı, kaydedilmemiş değişiklik)
    lib/
      config.js              Site ayarları, katalog, sabitler (çerçeve türleri, rozetler, sosyal ağlar)
      supabaseClient.js      Tek Supabase istemcisi (yalnızca anon key)
      errors.js              Supabase/ağ hatalarını kısa Türkçe mesajlara çevirir
      image.js               Yükleme öncesi küçültme + WebP'ye çevirme
      dom.js, format.js, validate.js, theme.js
    services/
      adapters/
        contract.js          Adapter sözleşmesi (servisler yalnızca buna bağlı)
        supabaseAdapter.js   Supabase (PostgREST + Storage + Auth)
        demoAdapter.js       localStorage; demo-seed.json'dan başlar
        demo-seed.json       ÜRETİLİR (supabase/scripts/gen-seed.mjs)
      projectsService.js     Proje CRUD, doğrulama, sıralama
      contentService.js      Bölümler: hero, hakkımda, hizmetler, iletişim, SEO, referanslar
      mediaService.js        Görsel kütüphanesi: yükleme, kullanım tespiti, silme
      messagesService.js     Gelen kutusu: okundu / arşiv / silme
      settingsService.js     Site ayarları, sosyal linkler, panel teması
      index.js               Adapter'ı seçip tüm servisleri bağlar
    components/              sidebar, topbar, dataTable, modal, confirmDialog, formField, toast, emptyState
    pages/                   login, dashboard, projects, projectEdit, content, media, messages, settings
  README.md
```

Katmanlar tek yönlüdür: **sayfalar → servisler → adapter → Supabase / localStorage**. Sayfalar Supabase'i hiç görmez. Servisler veritabanı satırlarını sitenin kullandığı biçime çevirir ve doğrular. Veritabanı da aynı kuralları `check` kısıtlarıyla ayrıca uygular.

## Herkese açık site veriyi nasıl okur?

`app.js`, içeriği tek istekle `rpc/site_payload` üzerinden alır. Bu SQL fonksiyonu tabloları `content.js`'teki `DEFAULT_CONTENT` biçiminde birleştirir. Sıra şöyledir:

1. `site_payload()` (yeni tablolar)
2. Fonksiyon yoksa eski `site_content` tablosu (tek satır JSON)
3. Hiçbiri yoksa ya da 2,5 saniyede yanıt gelmezse `content.js`

Supabase bağlı değilken site bugünkü gibi `content.js` ile çalışır.

---

## Yerelde çalıştırma

### A) Demo modu (kurulum gerektirmez)

```bash
python3 -m http.server 5173
```

`http://localhost:5173/admin/` adresini aç. Panel girişsiz ve demo verisiyle açılır. Ayarlar → **Demo verisini sıfırla** ile başa dönebilirsin.

### B) Yerel Supabase ile (gerçek giriş, RLS, Storage)

Gerekenler: Docker ve [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase start                                   # migration'ları ve seed.sql'i uygular (portlar 5442x)
node supabase/scripts/local-admin.mjs            # admin@portfolio.test hesabını oluşturur/yeniler
node supabase/scripts/local-config.mjs on        # config.js → yerel Supabase
python3 -m http.server 5173
```

`http://localhost:5173/admin/` adresini aç ve şu hesapla giriş yap: **admin@portfolio.test**. Şifre `.env.local` dosyasında; görmek için `grep LOCAL_TEST_ADMIN_PASSWORD .env.local`.

Yerel Supabase Studio: `http://127.0.0.1:54423`.

> **Commit etmeden önce:** `node supabase/scripts/local-config.mjs off`. `config.js` yerel anahtarla commit'lenmemeli.

Veritabanını seed'e döndürmek için `supabase db reset` çalıştırabilirsin. Bu komut kullanıcıları da sildiği için ardından `local-admin.mjs`'i tekrar çalıştır.

Bu projenin yerel Supabase portları 5442x aralığındadır (`supabase/config.toml`), böylece varsayılan 5432x portlarını kullanan başka bir yerel Supabase projesiyle çakışmaz.

---

## Ortam değişkenleri ve anahtarlar

| Nerede | Ne | Not |
|---|---|---|
| `config.js` | `supabaseUrl`, `supabaseAnonKey`, `siteUrl` | Herkese açıktır ve öyle tasarlanmıştır. Güvenliği RLS sağlar. |
| `.env.local` | Yerel URL, anon key, test admin bilgisi | Sadece yerel geliştirme için. `.gitignore` ve `.vercelignore` içinde, ne commit'lenir ne yayınlanır. |
| — | `service_role` anahtarı | **Hiçbir dosyada bulunmaz.** Tarayıcıya asla konmaz. `local-admin.mjs` onu yalnızca çalıştığı sürece bellekte tutar. |

Site build adımı olmayan statik bir site olduğu için tarayıcı `.env` dosyalarını okuyamaz. Bu yüzden anon key `config.js`'te durur.

---

## Supabase kurulumu (canlı)

1. [supabase.com](https://supabase.com)'da bir proje oluştur (ücretsiz plan yeterli).
2. **Authentication → Users → Add user → Create new user**: kendi e-postanı ve güçlü bir şifre gir, **Auto Confirm User** açık kalsın.
3. **Authentication → Sign In / Providers**: **Allow new users to sign up** seçeneğini **kapat**. Böylece başka kimse hesap açamaz.
4. **SQL Editor**'da şu dosyaların içeriğini **sırayla** yapıştırıp çalıştır:
   1. `supabase/migrations/20261023000000_baseline.sql`
   2. `supabase/migrations/20261023000100_cms_schema.sql`
   3. `supabase/seed.sql` (sitenin bugünkü içeriği; tekrar çalıştırılırsa mevcut kayıtların üzerine yazmaz)
5. Kendini yönetici yap (SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'SENIN@EPOSTAN.com'
   on conflict do nothing;
   ```
6. **Project Settings → API** sayfasından **Project URL** ve **anon public** anahtarını `config.js`'e yaz (`siteUrl` olarak da yayın adresini).
7. Yayınla (GitHub → Vercel ya da `npx vercel --prod`). Panel `https://alan-adin.com/admin` adresinde açılır.

CLI tercih edersen 4. adımın yerine: `supabase link --project-ref <ref>` ve `supabase db push`. Ardından `seed.sql`'i SQL Editor'da çalıştır.

Eski `supabase/setup.sql` daha önce çalıştırıldıysa sorun olmaz. Baseline migration aynı şemayı tekrar oluşturmaz (idempotent) ve `site_content` verisine dokunmaz.

---

## Veri modeli ve güvenlik (RLS)

| Tablo | İçerik | Ziyaretçi (anon) | Yönetici |
|---|---|---|---|
| `projects` | Proje kartları (ad, kategori, açıklama, etiketler, bilgiler, teknolojiler, görseller, rozet, tema, sıra, yayında/taslak) | Yalnızca yayındakileri okur | Tam yetki |
| `content_sections` | `hero`, `about`, `services`, `contact`, `seo`, `testimonials` | Okur | Ekler/günceller |
| `settings` | Tek satır: durum, e-posta, LinkedIn, sosyal linkler, form anahtarı, panel teması, varsayılan kart teması | Okur | Ekler/günceller |
| `media` | Görsel kütüphanesi kayıtları (`storage` = yüklenen, `builtin` = repodaki `media/`) | Erişemez | Okur/ekler; yalnızca `storage` kayıtlarını siler |
| `messages` | İletişim formu mesajları | **Yalnızca ekler** (okuyamaz). Aynı e-postadan 10 dakikada en fazla 3, toplamda 30 mesaj | Okur, durum değiştirir, siler |
| `admins` | Panele girebilecek hesaplar | — | Kendini okur |

Storage bucket'ı `media` herkese açık okunur, yalnızca yöneticiler yazar ve siler. Yeni kayıt açmak kapalıdır. Giriş yapan ama `admins` tablosunda olmayan bir hesap panele alınmaz.

---

## Paneli kullanma

- **Genel bakış:** Proje, yayında, taslak ve yeni mesaj sayıları; son aktivite; hızlı erişim.
- **Projeler:** Arama (ad, kategori, etiket, teknoloji); durum, rozet ve yerleşim filtreleri; sütuna göre sıralama.
  - **Sıra değiştirme:** Satırı tutamaçtan sürükle ya da tutamaca odaklanıp ↑/↓ tuşlarını kullan. Sıra hemen kaydedilir ve sitede aynı sırayla görünür. Filtre veya sütun sıralaması açıkken sürükleme kapalıdır.
- **Proje düzenleme:** TR/EN alanlar, kısa ad (yalnızca oluştururken), yayında/taslak, büyük kart/liste, rozet, kart teması, hazır mockup, etiketler, proje bilgileri, teknolojiler.
  - **Görseller:** Yükle ya da kütüphaneden seç. Her görsel için çerçeve seçilir: hazır sahne, tarayıcı veya telefon.
  - **Birden fazla "Hazır sahne" görseli:** Her biri için bir **sekme adı** (örn. Website / Dashboard) gir ve **sitede ilk açılacak görünümü** seç. Site bunları sekmeli geçişle gösterir.
  - **Kapak:** İlk görsel kapaktır ve paneldeki küçük görsel olarak kullanılır.
  - **Kayıt:** Kaydedilmemiş değişiklik varsa sayfadan çıkarken uyarı verir. `Ctrl/⌘+S` kaydeder.
- **İçerik:** Altı bölüm sekmelerde. Hizmetler ve referanslar eklenip çıkarılabilir ve sıralanabilir. SEO alanlarında karakter sayacı var.
  - Sosyal medya önizlemeleri (`og:` etiketleri) `index.html`'de sabit kalır.
- **Medya:** Sürükle-bırak ile yükleme; dosyalar en fazla 2200 px'e küçültülüp WebP'ye çevrilir. URL kopyalama, açıklama düzenleme. Silerken görsel bir projede kullanılıyorsa uyarı verir. Repodaki dosyalar silinemez.
- **Mesajlar:** Gelen kutusu, okunmamış, arşiv ve tümü filtreleri; arama. Açılan mesaj okundu sayılır. Okunmadı yap, arşivle, sil (onaylı) ve e-postayla yanıtla seçenekleri var.
- **Ayarlar:** Durum (müsait/sınırlı/meşgul ve tarih), e-posta, LinkedIn, sosyal linkler (footer'da gösterilir), web3forms anahtarı, panel teması (sistem/açık/koyu), yeni projeler için varsayılan kart teması.
  - Sitenin renk paleti sabittir ve panelden değiştirilemez.
- **Klavye:** "İçeriğe geç" bağlantısı, görünür odak, `Esc` ile pencere ve menü kapatma, sekmelerde ←/→.

---

## Seed ve demo verisini yeniden üretme

`content.js`, `app.js` içindeki metinler veya `index.html`'deki hizmetler değişirse:

```bash
node supabase/scripts/gen-seed.mjs     # supabase/seed.sql + admin/js/services/adapters/demo-seed.json
```

## Sorun giderme

- **"Bu hesabın panel yetkisi yok":** Hesap `admins` tablosunda değil. Yukarıdaki 5. adımı çalıştır.
- **"E-posta veya şifre hatalı":** Supabase → Authentication → Users'tan şifreyi sıfırla.
- **Panel demo modunda açılıyor:** `config.js`'teki `supabaseUrl` veya `supabaseAnonKey` boş.
- **Site eski içeriği gösteriyor:** `cms_schema` migration'ı ve `seed.sql` çalıştırıldı mı? Tarayıcı konsolunda `rpc/site_payload` isteğine bak.
- **`supabase start` port hatası veriyor:** Başka bir yerel Supabase aynı portları kullanıyor olabilir; `supabase/config.toml` içindeki portları değiştir.
