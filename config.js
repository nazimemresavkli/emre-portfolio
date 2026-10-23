/*
  Site ayarları
  -------------
  Supabase'i kurduktan sonra aşağıdaki iki değeri doldur (KURULUM.md'ye bak).
  Bu değerler herkese açık olabilir; güvenliği veritabanı kuralları sağlar.
  Boş bıraktığında site, content.js içindeki varsayılan içerikle çalışır
  ve /admin paneli "demo modunda" açılır.
*/
window.SITE_CONFIG = {
  supabaseUrl: "",      // örnek: "https://abcdefgh.supabase.co"
  supabaseAnonKey: "",  // Supabase > Project Settings > API > anon public
  siteUrl: ""           // yayına aldığın adres, örnek: "https://emresavkli.com"
};
