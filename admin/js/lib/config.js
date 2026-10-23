// Site configuration and static catalog.
// admin/index.html loads /config.js and /content.js as classic scripts first, so their globals are ready here.

export const SITE_CONFIG = window.SITE_CONFIG || {};
export const CATALOG = window.TECH_CATALOG || { layers: [], tech: [], badges: {}, themes: {} };
export const DEFAULT_CONTENT = window.DEFAULT_CONTENT || {};

/** True when config.js has a Supabase URL and anon key; otherwise the panel runs in demo mode. */
export const isConfigured = () => Boolean(SITE_CONFIG.supabaseUrl && SITE_CONFIG.supabaseAnonKey);

/** Hand-built HTML mockups that exist in index.html as <template id="mock-…">. */
export const MOCKS = ['lara', 'farabi', 'northwind', 'pulse', 'nesto', 'sofra', 'yaser', 'subs'];

/** Social profiles the public footer knows how to render (see SOCIALS in /app.js). */
export const SOCIALS = [
  ['github', 'GitHub'], ['x', 'X'], ['instagram', 'Instagram'], ['behance', 'Behance'],
  ['dribbble', 'Dribbble'], ['youtube', 'YouTube'], ['medium', 'Medium']
];

export const FRAMES = [
  ['scene', 'Hazır sahne (çerçeve görselin içinde)'],
  ['browser', 'Tarayıcı çerçevesi'],
  ['phone', 'Telefon çerçevesi']
];

/** Badge names as the panel shows them ("Yayında" alone would be confused with published/draft). */
export const BADGES = [
  ['shipped', 'Yayınlanmış ürün'], ['inuse', 'Yayınlanmış · günlük kullanımda'], ['concept', 'Konsept'], ['', 'Rozet yok']
];

export const STATUSES = [
  ['available', 'Müsait'], ['limited', 'Sınırlı'], ['busy', 'Meşgul']
];

/** Image src usable from /admin/: repo paths like "media/x.webp" are relative to the site root. */
export const mediaSrc = url => (/^(https?:|data:|\/)/.test(url || '') ? url : '/' + url);

/** Public URL of the site root (used for "view site" links and absolute media URLs). */
export const siteOrigin = () => (SITE_CONFIG.siteUrl || location.origin).replace(/\/$/, '');
