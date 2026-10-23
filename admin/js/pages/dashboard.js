import { h, icon, mount } from '../lib/dom.js';
import { tr, ago, dateTime } from '../lib/format.js';
import { siteOrigin } from '../lib/config.js';
import { SECTIONS } from '../services/contentService.js';

export async function render({ services, root }) {
  const [projects, sections, messages] = await Promise.all([
    services.projects.list(), services.content.getAll(), services.messages.list('all')
  ]);
  const live = projects.filter(p => p.visible).length;
  const fresh = messages.filter(m => m.status === 'new').length;

  const stat = (label, value, note, href) => h(href ? 'a' : 'div', { class: 'card stat', href },
    h('small', { text: label }), h('b', { text: String(value) }), h('span', { text: note }));

  // Recent activity: project edits, section edits and incoming messages, newest first.
  const items = [
    ...projects.filter(p => p.updatedAt).map(p => ({ at: p.updatedAt, icon: 'projects', text: `${tr(p.name) || p.id} güncellendi`, href: `#/projects/${p.id}` })),
    ...SECTIONS.filter(s => sections[s.key].updatedAt).map(s => ({ at: sections[s.key].updatedAt, icon: 'content', text: `${s.label} bölümü kaydedildi`, href: `#/content/${s.key}` })),
    ...messages.map(m => ({ at: m.created_at, icon: 'messages', text: `${m.name} mesaj gönderdi`, href: `#/messages/${m.id}` }))
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);

  mount(root,
    h('div', { class: 'page-head' },
      h('div', {}, h('h2', { text: 'Genel bakış' }), h('p', { text: 'Sitenin içeriği ve gelen mesajlar tek bakışta.' })),
      h('div', { class: 'page-actions' }, h('a', { class: 'btn btn-primary', href: '#/projects/new' }, icon('plus', 16), 'Yeni proje'))),
    h('div', { class: 'stats' },
      stat('Toplam proje', projects.length, `${projects.filter(p => p.featured).length} öne çıkan`, '#/projects'),
      stat('Yayında', live, 'sitede görünen', '#/projects'),
      stat('Taslak', projects.length - live, 'sitede gizli', '#/projects'),
      stat('Yeni mesaj', fresh, `${messages.length} mesajın içinde`, '#/messages')),
    h('div', { class: 'grid-2' },
      h('section', { class: 'card', 'aria-labelledby': 'act-h' },
        h('div', { class: 'card-head' }, h('h3', { id: 'act-h', text: 'Son aktivite' })),
        items.length
          ? h('ul', { class: 'activity' }, items.map(i => h('li', {},
              h('span', { class: 'dot' }, icon(i.icon, 16)),
              h('div', {}, h('a', { href: i.href, text: i.text }), h('time', { datetime: i.at, title: dateTime(i.at), text: ago(i.at) })))))
          : h('p', { class: 'muted', style: { padding: '20px' }, text: 'Henüz bir hareket yok.' })),
      h('section', { class: 'card', 'aria-labelledby': 'quick-h' },
        h('div', { class: 'card-head' }, h('h3', { id: 'quick-h', text: 'Hızlı erişim' })),
        h('div', { class: 'quick' },
          h('a', { class: 'btn', href: '#/projects/new' }, icon('plus', 16), 'Proje ekle'),
          h('a', { class: 'btn', href: '#/content/hero' }, icon('content', 16), 'Giriş metnini düzenle'),
          h('a', { class: 'btn', href: '#/content/services' }, icon('content', 16), 'Hizmetleri düzenle'),
          h('a', { class: 'btn', href: '#/media' }, icon('upload', 16), 'Görsel yükle'),
          h('a', { class: 'btn', href: '#/messages' }, icon('messages', 16), fresh ? `Yeni mesajlar (${fresh})` : 'Mesajlar'),
          h('a', { class: 'btn', href: siteOrigin() + '/', target: '_blank', rel: 'noopener' }, icon('external', 16), 'Siteyi yeni sekmede aç')))));
}
