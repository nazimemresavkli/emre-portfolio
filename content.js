/*
  Varsayılan içerik. Supabase bağlıysa site içeriği yönetim panelinden gelir;
  bağlı değilse ya da veri alınamazsa bu dosya kullanılır.
*/
window.DEFAULT_CONTENT = {
  settings: {
    status: "available",                 // "available" | "limited" | "busy"
    availableFrom: { tr: "", en: "" },   // meşgulken: "Ocak 2027" / "January 2027"
    email: "nazimemresavkli@gmail.com",
    linkedin: "https://www.linkedin.com/in/emre246/",
    formAccessKey: ""                    // web3forms.com erişim anahtarı (boşsa form e-posta uygulamasını açar)
  },
  texts: {
    hero_lede: {
      tr: "**Flutter ile mobil uygulamalar, Next.js ile web panelleri ve Supabase / Go backend'leri** geliştiriyor, mimariden mağaza yayınına kadar tüm süreci üstleniyorum.",
      en: "I build **Flutter mobile apps, Next.js web panels and Supabase / Go backends**, handling the full lifecycle from architecture to release."
    },
    statement: {
      tr: "Ben Emre; 10 yılı aşkın yazılım deneyimine sahip, bugün ağırlıklı olarak Flutter ve full-stack çalışan bir geliştiriciyim. Mobil uygulamayı, arkasındaki web panelini ve ikisini birbirine bağlayan backend'i geliştiriyor, işi yayına kadar götürüyorum. Aynı zamanda yazılım eğitmeniyim; teknik kararları sade bir dille anlatır, teknik olmayan kurucularla rahatça çalışırım.",
      en: "I'm Emre, a developer with 10+ years in software, working mainly in Flutter and full-stack today. I build the mobile app, the web panel behind it and the backend that ties them together, and take the whole thing to release. I'm also a software instructor, so I explain technical decisions in plain language and work well with non-technical founders."
    },
    about_more: {
      tr: "Tipik bir projede Flutter mobil uygulamayı, Next.js yönetim panelini ve Supabase, Go ya da PostgreSQL backend'ini geliştiriyorum. Yapay zekâ destekli çalışıyorum; bunu Clean Architecture, sıkı kod incelemesi ve her sürüm öncesi güvenlik incelemesiyle dengede tutuyorum.",
      en: "On a typical project I build the Flutter mobile app, a Next.js admin panel and a Supabase, Go or PostgreSQL backend, with an AI-assisted workflow kept in check by Clean Architecture, strict code review and a security review before every release."
    },
    c_lede: {
      tr: "Aklınızda bir uygulama ya da web ürünü mü var? Mimariden yayına kadar tüm süreci üstlenebilir ya da mevcut bir kod tabanına dahil olabilirim. Serbest ve sözleşmeli işlere açığım.",
      en: "Have an app or web product in mind? I can take it from architecture to a shipped release, or jump into an existing codebase. Open to freelance and contract work."
    }
  },
  testimonials: [],
  projects: [
    {
      id: "lara", visible: true, featured: true, badge: "shipped", theme: "slate", mock: "lara",
      name: { tr: "Lara Laundry", en: "Lara Laundry" },
      cat: { tr: "Talep üzerine çamaşırhane pazaryeri", en: "On-demand laundry marketplace" },
      desc: {
        tr: "Müşteri uygulaması, personel operasyon uygulaması ve yönetim paneli tek bir backend üzerinde: rezervasyon, canlı sipariş takibi, cüzdan ve sadakat puanı defteri, kuponlar ve ödemeler; açık ve koyu temada.",
        en: "Customer app, staff operations app and admin panel on one backend: booking, live order tracking, a wallet-and-loyalty ledger, coupons and payments, in light and dark themes."
      },
      tags: { tr: ["Müşteri uygulaması", "Operasyon uygulaması", "Yönetim paneli"], en: ["Customer app", "Operations app", "Admin panel"] },
      facts: [
        { l: { tr: "Rol", en: "Role" }, v: { tr: "Uçtan uca geliştirme", en: "Full build" } },
        { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Go, PostgreSQL", en: "Flutter, Go, PostgreSQL" } },
        { l: { tr: "Öne çıkanlar", en: "Highlights" }, v: { tr: "Cüzdan ve sadakat defteri, canlı takip", en: "Wallet and loyalty ledger, live tracking" } }
      ],
      tech: ["flutter", "dart", "riverpod", "go", "postgres", "rest", "admin", "cleanarch", "aidev", "review", "git"],
      media: [{ url: "media/lara.webp", frame: "scene" }]
    },
    {
      id: "farabi", visible: true, featured: true, badge: "inuse", theme: "navy", mock: "farabi",
      name: { tr: "Farabi BES", en: "Farabi BES" },
      cat: { tr: "İşletmede beceri eğitimi platformu", en: "Work-based training platform" },
      desc: {
        tr: "Bir meslek lisesi için öğretmen ve koordinatörlerin kullandığı mobil uygulama ile web yönetim paneli: yoklama, işletme yerleştirmeleri, ücret dekontu takibi, onay akışları ve PDF raporlar.",
        en: "A mobile app for teachers and coordinators plus a web admin panel for a vocational high school: attendance, placements, salary-receipt tracking, approval flows and PDF reports."
      },
      tags: { tr: ["Öğretmen uygulaması", "Web yönetim paneli", "Rol bazlı erişim"], en: ["Teacher app", "Web admin panel", "Role-based access"] },
      facts: [
        { l: { tr: "Rol", en: "Role" }, v: { tr: "Uçtan uca geliştirme (ortak)", en: "Full build (co-developed)" } },
        { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Next.js, Supabase", en: "Flutter, Next.js, Supabase" } },
        { l: { tr: "Günlük kullanımda", en: "In daily use" }, v: { tr: "85 öğrenci, 22 öğretmen", en: "85 students, 22 teachers" } }
      ],
      tech: ["flutter", "dart", "nextjs", "react", "supabase", "postgres", "admin", "cleanarch", "aidev", "review", "git"],
      media: [{ url: "media/farabi.webp", frame: "scene" }]
    },
    {
      id: "northwind", visible: true, featured: true, badge: "concept", theme: "forest", mock: "",
      name: { tr: "Northwind", en: "Northwind" },
      cat: { tr: "Perakende operasyon platformu", en: "Retail operations platform" },
      desc: {
        tr: "Ürün odaklı bir tanıtım sitesi ve arkasındaki yoğun veri içeren yönetim paneli: canlı KPI'lar, gelir ve kanal analizleri, siparişler ve stok.",
        en: "A product-led marketing website and the data-dense admin dashboard behind it: live KPIs, revenue and channel analytics, orders and inventory."
      },
      tags: { tr: ["Tanıtım sitesi", "Yönetim paneli", "Analitik"], en: ["Marketing site", "Admin dashboard", "Analytics"] },
      facts: [
        { l: { tr: "Rol", en: "Role" }, v: { tr: "Tasarım ve front-end", en: "Design & front-end" } },
        { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Next.js, React, TypeScript", en: "Next.js, React, TypeScript" } },
        { l: { tr: "Kapsam", en: "Scope" }, v: { tr: "Tanıtım sitesi ve yönetim paneli", en: "Marketing site and dashboard" } }
      ],
      tech: ["nextjs", "react", "typescript", "tailwind", "admin", "figma"],
      media: [
        { url: "media/northwind_site.webp", frame: "scene", label: "Website" },
        { url: "media/northwind.webp", frame: "scene", label: "Dashboard", active: true }
      ]
    },
    {
      id: "pulse", visible: true, featured: true, badge: "concept", theme: "olive", mock: "",
      name: { tr: "Pulse", en: "Pulse" },
      cat: { tr: "Yapay zekâ destekli fitness koçluğu", en: "AI-guided fitness coaching" },
      desc: {
        tr: "Uyarlanabilir haftalık plan oluşturuyor, her antrenmanı canlı set takibi ve kas haritasıyla yönlendiriyor, antrenmanları net bir ilerlemeye dönüştürüyor.",
        en: "Builds an adaptive weekly plan, coaches each session with a live set tracker and muscle map, and turns workouts into clear progress."
      },
      tags: { tr: ["Uyarlanabilir plan", "Canlı set takibi", "İlerleme analizi"], en: ["Adaptive plans", "Live set tracker", "Progress analytics"] },
      facts: [
        { l: { tr: "Rol", en: "Role" }, v: { tr: "Ürün tasarımı ve front-end", en: "Product design & front-end" } },
        { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Riverpod, HealthKit", en: "Flutter, Riverpod, HealthKit" } },
        { l: { tr: "Platform", en: "Platform" }, v: { tr: "iOS ve Android", en: "iOS & Android" } }
      ],
      tech: ["flutter", "dart", "riverpod", "healthkit", "figma"],
      media: [{ url: "media/pulse.webp", frame: "scene" }]
    },
    {
      id: "nesto", visible: true, featured: true, badge: "concept", theme: "blush", mock: "",
      name: { tr: "Nesto", en: "Nesto" },
      cat: { tr: "Talep üzerine ev hizmetleri", en: "On-demand home services" },
      desc: {
        tr: "Onaylı ustalara göz atın, birkaç dokunuşla rezervasyon yapın, ardından ustanızı haritada canlı takip edin; ödeme uygulama içinde.",
        en: "Browse vetted pros, book in a few taps, then follow your pro live on the map, with payment handled in app."
      },
      tags: { tr: ["Canlı takip", "Uygulama içi ödeme", "Rezervasyon"], en: ["Real-time tracking", "In-app payments", "Booking"] },
      facts: [
        { l: { tr: "Rol", en: "Role" }, v: { tr: "Ürün tasarımı ve front-end", en: "Product design & front-end" } },
        { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Maps SDK, Stripe", en: "Flutter, Maps SDK, Stripe" } },
        { l: { tr: "Platform", en: "Platform" }, v: { tr: "iOS ve Android", en: "iOS & Android" } }
      ],
      tech: ["flutter", "dart", "maps", "stripe", "figma"],
      media: [{ url: "media/nesto.webp", frame: "scene" }]
    },
    {
      id: "sofra", visible: true, featured: true, badge: "concept", theme: "cocoa", mock: "",
      name: { tr: "Sofra", en: "Sofra" },
      cat: { tr: "Restoran siparişi ve teslimat", en: "Restaurant ordering & delivery" },
      desc: {
        tr: "Zengin menü ve yemek detayı, kişiselleştirme, akıcı bir sepet ve mutfaktan kapıya canlı teslimat takibi.",
        en: "A rich menu and dish detail, customisation, a smooth cart, and live delivery tracking from kitchen to door."
      },
      tags: { tr: ["Menü ve sepet", "Kişiselleştirme", "Canlı teslimat"], en: ["Menu & cart", "Customisation", "Live delivery"] },
      facts: [
        { l: { tr: "Rol", en: "Role" }, v: { tr: "Ürün tasarımı ve front-end", en: "Product design & front-end" } },
        { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Go, Maps", en: "Flutter, Go, Maps" } },
        { l: { tr: "Platform", en: "Platform" }, v: { tr: "iOS ve Android", en: "iOS & Android" } }
      ],
      tech: ["flutter", "dart", "go", "maps", "figma"],
      media: [{ url: "media/sofra.webp", frame: "scene" }]
    },
    {
      id: "yaser", visible: true, featured: false, badge: "", theme: "graphite", mock: "yaser",
      name: { tr: "Yaser Turizm", en: "Yaser Turizm" },
      cat: { tr: "B2B tur operasyon uygulaması", en: "B2B tour-operations app" },
      desc: {
        tr: "Otobüs koltuk planlama, grup rezervasyonları, kapora takibi ve Excel/PDF dışa aktarım.",
        en: "Bus seat planning, group bookings, deposit tracking and Excel/PDF export."
      },
      tags: { tr: [], en: [] },
      facts: [ { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Riverpod, Supabase", en: "Flutter, Riverpod, Supabase" } } ],
      tech: ["flutter", "dart", "riverpod", "supabase", "postgres", "cleanarch", "git"],
      media: []
    },
    {
      id: "subs", visible: true, featured: false, badge: "shipped", theme: "amber", mock: "subs",
      name: { tr: "Abonelikli uygulamalarım", en: "My subscription apps" },
      cat: { tr: "App Store ve Google Play'de", en: "On the App Store and Google Play" },
      desc: {
        tr: "Kendi geliştirip yayınladığım uygulamalar: yapay zekâ analizi, ücretsiz denemeli abonelikler ve 14 dil.",
        en: "Apps I built and published myself: AI analysis, subscriptions with free trials and 14 languages."
      },
      tags: { tr: [], en: [] },
      facts: [ { l: { tr: "Teknolojiler", en: "Stack" }, v: { tr: "Flutter, Supabase, RevenueCat", en: "Flutter, Supabase, RevenueCat" } } ],
      tech: ["flutter", "dart", "supabase", "postgres", "revenuecat", "stores", "openai"],
      media: []
    }
  ]
};

/* Teknoloji kataloğu: katman haritası ve paneldeki seçim listesi buradan gelir. */
window.TECH_CATALOG = {
  layers: [
    { id: "mobile",  color: "#8B9BFF", name: { tr: "Mobil", en: "Mobile" } },
    { id: "web",     color: "#C7A4FF", name: { tr: "Web ve kurumsal", en: "Web & business" } },
    { id: "backend", color: "#4ADE9B", name: { tr: "Backend", en: "Backend" } },
    { id: "data",    color: "#6EB6FF", name: { tr: "Veri", en: "Data" } },
    { id: "pay",     color: "#FFC07A", name: { tr: "Ödeme ve yayın", en: "Payments & release" } },
    { id: "ai",      color: "#FF8FA3", name: { tr: "Yapay zekâ ve görünürlük", en: "AI & visibility" } },
    { id: "work",    color: "#E6E8EE", process: true, name: { tr: "Çalışma şekli", en: "Ways of working" } }
  ],
  tech: [
    { id: "flutter",  layer: "mobile",  name: "Flutter",  d: { tr: "Mobil uygulamalarımın tamamı: tek kod tabanından iOS ve Android.", en: "Every mobile app I ship: one codebase for iOS and Android." } },
    { id: "dart",     layer: "mobile",  name: "Dart",     d: { tr: "Flutter'ın dili; uygulama mantığı ve veri modelleri.", en: "The language behind Flutter: app logic and data models." } },
    { id: "riverpod", layer: "mobile",  name: "Riverpod", d: { tr: "Durum yönetimi; Clean Architecture ile birlikte.", en: "State management, paired with Clean Architecture." } },
    { id: "kotlin",   layer: "mobile",  name: "Kotlin",   d: { tr: "Native Android geliştirme ve verdiğim Android eğitimleri.", en: "Native Android development and the Android courses I teach." } },
    { id: "java",     layer: "mobile",  name: "Java",     d: { tr: "Android'in temeli; eğitimlerimde ve eski projelerde.", en: "The foundation of Android; in my courses and earlier projects." } },
    { id: "compose",  layer: "mobile",  name: "Jetpack Compose", d: { tr: "Modern native Android arayüzleri.", en: "Modern native Android interfaces." } },
    { id: "swift",    layer: "mobile",  name: "Swift",    d: { tr: "iOS'a özel yapılandırmalar ve App Store yayın süreci.", en: "iOS-specific configuration and App Store releases." } },
    { id: "maps",     layer: "mobile",  name: "Maps SDK", d: { tr: "Canlı konum ve teslimat takibi.", en: "Live location and delivery tracking." } },
    { id: "healthkit",layer: "mobile",  name: "HealthKit", d: { tr: "Sağlık ve antrenman verisi entegrasyonu.", en: "Health and workout data integration." } },
    { id: "nextjs",   layer: "web",     name: "Next.js",  d: { tr: "Web uygulamaları, tanıtım siteleri ve yönetim panelleri.", en: "Web applications, marketing sites and admin panels." } },
    { id: "react",    layer: "web",     name: "React",    d: { tr: "Web arayüzlerinin bileşen katmanı.", en: "The component layer of my web interfaces." } },
    { id: "typescript", layer: "web",   name: "TypeScript", d: { tr: "Tip güvenli web kodu.", en: "Type-safe web code." } },
    { id: "tailwind", layer: "web",     name: "Tailwind CSS", d: { tr: "Hızlı ve tutarlı arayüz stilleri.", en: "Fast, consistent interface styling." } },
    { id: "vue",      layer: "web",     name: "Vue.js",   d: { tr: "Gerektiğinde alternatif web arayüzü çatısı.", en: "An alternative web UI framework when a project needs it." } },
    { id: "admin",    layer: "web",     name: { tr: "Yönetim panelleri", en: "Admin panels" }, d: { tr: "İçeriği, kullanıcıları ve süreçleri kod yazmadan yönettiğiniz paneller.", en: "Panels where you manage content, users and operations without code." } },
    { id: "aspnet",   layer: "web",     name: "ASP.NET MVC", d: { tr: "Kurumsal web uygulamaları.", en: "Business web applications." } },
    { id: "php",      layer: "web",     name: "PHP",      d: { tr: "Web projeleri ve web teknolojileri derslerim.", en: "Web projects and the web technology courses I teach." } },
    { id: "supabase", layer: "backend", name: "Supabase", d: { tr: "Kimlik doğrulama, veritabanı, dosya depolama, gerçek zamanlı veri ve rol bazlı erişim.", en: "Auth, database, storage, real-time data and role-based access." } },
    { id: "go",       layer: "backend", name: "Go",       d: { tr: "Hızlı ve sade API'ler.", en: "Fast, plain APIs." } },
    { id: "nodejs",   layer: "backend", name: "Node.js",  d: { tr: "JavaScript tabanlı servisler ve entegrasyonlar.", en: "JavaScript services and integrations." } },
    { id: "rest",     layer: "backend", name: "REST API", d: { tr: "Mobil ve web istemcilerinin konuştuğu API'ler.", en: "The APIs mobile and web clients talk to." } },
    { id: "firebase", layer: "backend", name: "Firebase", d: { tr: "Gerektiğinde kimlik doğrulama, bildirim ve analitik.", en: "Auth, notifications and analytics when a project needs it." } },
    { id: "postgres", layer: "data",    name: "PostgreSQL", d: { tr: "Veri modellerinin temeli; Supabase de PostgreSQL üzerinde çalışır.", en: "The base of my data models; Supabase runs on PostgreSQL too." } },
    { id: "sqlserver",layer: "data",    name: "SQL Server", d: { tr: "Kurumsal veritabanları ve veritabanı derslerim.", en: "Business databases and the database courses I teach." } },
    { id: "stripe",   layer: "pay",     name: "Stripe",   d: { tr: "Uluslararası ödemeler.", en: "International payments." } },
    { id: "iyzico",   layer: "pay",     name: "iyzico",   d: { tr: "Türkiye'deki ödemeler.", en: "Payments in Türkiye." } },
    { id: "revenuecat", layer: "pay",   name: "RevenueCat", d: { tr: "Uygulama içi abonelikler ve ücretsiz denemeler.", en: "In-app subscriptions and free trials." } },
    { id: "stores",   layer: "pay",     name: { tr: "App Store ve Google Play", en: "App Store & Google Play" }, d: { tr: "TestFlight'tan mağaza incelemesine kadar yayın süreci.", en: "The release process, from TestFlight to store review." } },
    { id: "openai",   layer: "ai",      name: "OpenAI API", d: { tr: "Uygulama içi yapay zekâ analizleri ve asistanlar.", en: "In-app AI analysis and assistants." } },
    { id: "seo",      layer: "ai",      name: { tr: "Teknik SEO", en: "Technical SEO" }, d: { tr: "Hız, yapılandırılmış veri ve indekslenebilir sayfalar. Bu sitede de uygulandı.", en: "Speed, structured data and indexable pages. Applied on this site too." } },
    { id: "geo",      layer: "ai",      name: "GEO", d: { tr: "ChatGPT, Gemini ve Perplexity gibi yapay zekâ asistanlarında öne çıkmak için içerik yapısı ve llms.txt. Bu sitede de uygulandı.", en: "Content structure and llms.txt to stand out in AI assistants like ChatGPT, Gemini and Perplexity. Applied on this site too." } },
    { id: "cleanarch",layer: "work",    name: "Clean Architecture", d: { tr: "Ürün büyüdükçe kolayca değiştirilebilen kod yapısı.", en: "A code structure that stays easy to change as the product grows." } },
    { id: "aidev",    layer: "work",    name: { tr: "Yapay zekâ destekli geliştirme", en: "AI-assisted development" }, d: { tr: "Hızlı ilerleme; her satır inceleniyor ve test ediliyor.", en: "Faster progress, with every line reviewed and tested." } },
    { id: "review",   layer: "work",    name: { tr: "Kod ve güvenlik incelemesi", en: "Code & security review" }, d: { tr: "Her sürümden önce kod ve güvenlik kontrolü.", en: "Code and security checks before every release." } },
    { id: "git",      layer: "work",    name: "Git", d: { tr: "Sürüm kontrolü ve düzenli, izlenebilir teslimler.", en: "Version control and traceable, regular delivery." } },
    { id: "figma",    layer: "work",    name: "Figma", d: { tr: "Arayüz tasarımı ve prototipler.", en: "Interface design and prototypes." } },
    { id: "agile",    layer: "work",    name: "Agile", d: { tr: "Kısa döngüler ve sık geri bildirim.", en: "Short cycles and frequent feedback." } }
  ],
  badges: {
    shipped: { tr: "Yayında", en: "Shipped" },
    inuse:   { tr: "Yayında · günlük kullanımda", en: "Shipped · in daily use" },
    concept: { tr: "Konsept", en: "Concept" }
  },
  themes: {
    slate:    { bg: "#1A242C", fg: "#F1EFEA", glow: "#2C3E48", dark: true,  label: { tr: "Arduvaz", en: "Slate" } },
    navy:     { bg: "#172033", fg: "#F1EFEA", glow: "#24365A", dark: true,  label: { tr: "Lacivert", en: "Navy" } },
    forest:   { bg: "#0A2018", fg: "#F1EFEA", glow: "#0F3D2C", dark: true,  label: { tr: "Orman", en: "Forest" } },
    olive:    { bg: "#18201D", fg: "#F1EFEA", glow: "#2E3D22", dark: true,  label: { tr: "Zeytin", en: "Olive" } },
    blush:    { bg: "#ECE6E8", fg: "#0C0E13", glow: "#F9E6E0", dark: false, label: { tr: "Pudra", en: "Blush" } },
    cocoa:    { bg: "#231A10", fg: "#F1EFEA", glow: "#3E2E16", dark: true,  label: { tr: "Kakao", en: "Cocoa" } },
    cobalt:   { bg: "#2135EE", fg: "#FFFFFF", glow: "#4A5CFF", dark: false, label: { tr: "Kobalt", en: "Cobalt" } },
    lilac:    { bg: "#DDDCFB", fg: "#0C0E13", glow: "#F2F1FF", dark: false, label: { tr: "Lila", en: "Lilac" } },
    graphite: { bg: "#14161D", fg: "#F1EFEA", glow: "rgba(255,192,122,.18)", dark: true, label: { tr: "Grafit", en: "Graphite" } },
    amber:    { bg: "#FFC07A", fg: "#0C0E13", glow: "#FFE2BD", dark: false, label: { tr: "Kehribar", en: "Amber" } },
    mint:     { bg: "#C6F1DC", fg: "#0C0E13", glow: "#EAFBF2", dark: false, label: { tr: "Nane", en: "Mint" } },
    rose:     { bg: "#FF8FA3", fg: "#0C0E13", glow: "#FFD3DB", dark: false, label: { tr: "Gül", en: "Rose" } }
  }
};
