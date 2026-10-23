// Panel colour scheme: 'system' follows the OS, 'light' / 'dark' force it. The site's own palette is never touched.

const KEY = 'admin_theme';

export function applyTheme(pref) {
  const root = document.documentElement;
  if (pref === 'light' || pref === 'dark') root.dataset.theme = pref;
  else delete root.dataset.theme;
  try { localStorage.setItem(KEY, pref || 'system'); } catch { /* private mode */ }
}

export function cachedTheme() {
  try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
}

export const THEME_LABELS = { system: 'Sistem', light: 'Açık', dark: 'Koyu' };
export const nextTheme = t => ({ system: 'light', light: 'dark', dark: 'system' }[t] || 'system');
