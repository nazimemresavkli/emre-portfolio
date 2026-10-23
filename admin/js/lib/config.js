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

export const STATUSES = [
  ['available', 'Müsait'], ['limited', 'Sınırlı'], ['busy', 'Meşgul']
];

/** Public URL of the site root (used for "view site" links and absolute media URLs). */
export const siteOrigin = () => (SITE_CONFIG.siteUrl || location.origin).replace(/\/$/, '');
