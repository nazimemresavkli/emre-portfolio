import { h, icon } from '../lib/dom.js';
import { siteOrigin } from '../lib/config.js';

export const NAV = [
  { name: 'dashboard', href: '#/', label: 'Genel bakış', icon: 'dashboard' },
  { name: 'projects', href: '#/projects', label: 'Projeler', icon: 'projects' },
  { name: 'content', href: '#/content', label: 'İçerik', icon: 'content' },
  { name: 'media', href: '#/media', label: 'Medya', icon: 'media' },
  { name: 'messages', href: '#/messages', label: 'Mesajlar', icon: 'messages' },
  { name: 'settings', href: '#/settings', label: 'Ayarlar', icon: 'settings' }
];

/** createSidebar() → { el, update(state) } */
export function createSidebar({ onNavigate }) {
  const links = NAV.map(item => {
    const count = h('span', { class: 'count', hidden: true });
    const a = h('a', { href: item.href, dataset: { nav: item.name }, onclick: onNavigate }, icon(item.icon), h('span', { text: item.label }), count);
    return { item, a, count };
  });
  const mode = h('span', { class: 'mode-pill' });
  const el = h('aside', { class: 'sidebar', id: 'sidebar', 'aria-label': 'Ana menü' },
    h('a', { class: 'brand', href: '#/', onclick: onNavigate },
      h('span', { class: 'brand-mark', text: 'NE' }),
      h('span', {}, 'Emre Şavklı', h('small', { text: 'Yönetim paneli' }))),
    h('nav', { class: 'nav' }, links.map(l => l.a)),
    h('div', { class: 'sidebar-foot' },
      mode,
      h('a', { href: siteOrigin() + '/', target: '_blank', rel: 'noopener', class: 'muted', style: { textDecoration: 'none', display: 'inline-flex', gap: '6px', alignItems: 'center' } },
        icon('external', 15), 'Siteyi görüntüle')));

  return {
    el,
    update(state) {
      for (const { item, a, count } of links) {
        if (state.route?.nav === item.name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        if (item.name === 'messages') {
          count.hidden = !state.newMessages;
          count.textContent = state.newMessages > 99 ? '99+' : String(state.newMessages);
          a.setAttribute('aria-label', state.newMessages ? `Mesajlar, ${state.newMessages} yeni` : 'Mesajlar');
        }
      }
      mode.className = `mode-pill ${state.mode === 'supabase' ? 'mode-live' : 'mode-demo'}`;
      mode.textContent = state.mode === 'supabase' ? 'Canlı veri' : 'Demo modu';
    }
  };
}
