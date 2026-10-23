import { h, icon } from '../lib/dom.js';
import { THEME_LABELS } from '../lib/theme.js';

/** createTopbar({ onMenu, onTheme, onLogout }) → { el, update(state) } */
export function createTopbar({ onMenu, onTheme, onLogout }) {
  const title = h('h1', { id: 'page-title' });
  const menu = h('button', { class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'Menüyü aç', 'aria-controls': 'sidebar', 'aria-expanded': 'false', onclick: onMenu }, icon('menu'));
  const theme = h('button', { class: 'icon-btn', type: 'button', onclick: onTheme });
  const email = h('span', { class: 'user-email' });
  const logout = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: onLogout }, icon('logout', 16), h('span', { text: 'Çıkış' }));
  const el = h('header', { class: 'topbar' }, menu, title, h('div', { class: 'topbar-actions' }, email, theme, logout));

  return {
    el,
    menuButton: menu,
    update(state) {
      title.textContent = state.route?.title || '';
      const pref = state.settings?.adminTheme || 'system';
      theme.replaceChildren(icon(pref === 'dark' ? 'moon' : 'sun'));
      theme.setAttribute('aria-label', `Panel teması: ${THEME_LABELS[pref]} (değiştirmek için tıkla)`);
      theme.title = `Tema: ${THEME_LABELS[pref]}`;
      email.textContent = state.user?.email || '';
      logout.hidden = state.mode !== 'supabase';
    }
  };
}
