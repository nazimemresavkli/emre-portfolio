import { h, icon, mount } from '../lib/dom.js';
import { ago, dateTime } from '../lib/format.js';
import { friendlyError } from '../lib/errors.js';
import { emptyState } from '../components/emptyState.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { toast } from '../components/toast.js';

const FILTERS = [
  ['inbox', 'Gelen kutusu', m => m.status !== 'archived'],
  ['new', 'Okunmamış', m => m.status === 'new'],
  ['archived', 'Arşiv', m => m.status === 'archived'],
  ['all', 'Tümü', () => true]
];
const STATUS = { new: ['Yeni', 'badge-new'], read: ['Okundu', ''], archived: ['Arşivde', 'badge-draft'] };

// Kept across re-renders (selecting a message changes the URL and re-renders the page).
let filter = 'inbox';
let query = '';

export async function render({ services, root, params, navigate, refreshCounts }) {
  let messages = await services.messages.list('all');
  let selected = params.id ? messages.find(m => m.id === params.id) || null : null;

  // Opening an unread message marks it as read.
  if (selected?.status === 'new') {
    try { selected = await services.messages.setStatus(selected.id, 'read'); messages = messages.map(m => (m.id === selected.id ? selected : m)); refreshCounts(); }
    catch (e) { toast(friendlyError(e), 'error'); }
  }

  const listEl = h('div', { class: 'inbox-list', role: 'list', 'aria-label': 'Mesajlar' });
  const detailEl = h('div', { class: 'inbox-detail' });
  const inbox = h('div', { class: `inbox${selected ? ' show-detail' : ''}` }, listEl, detailEl);
  const search = h('input', { class: 'input', type: 'search', value: query, placeholder: 'İsim, e-posta veya içerik ara', 'aria-label': 'Mesajlarda ara',
    oninput: () => { query = search.value.trim(); drawList(); } });
  const tabs = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Mesaj filtresi' });

  const drawTabs = () => tabs.replaceChildren(...FILTERS.map(([v, t, fn]) => {
    const n = messages.filter(fn).length;
    return h('button', { type: 'button', role: 'radio', 'aria-checked': String(filter === v), 'aria-pressed': String(filter === v), text: `${t} (${n})`, onclick: () => { filter = v; drawTabs(); drawList(); } });
  }));

  function drawList() {
    const fn = FILTERS.find(f => f[0] === filter)[2];
    const q = query.toLocaleLowerCase('tr');
    const list = messages.filter(fn).filter(m => !q || [m.name, m.email, m.company, m.message, m.project_type].join(' ').toLocaleLowerCase('tr').includes(q));
    if (!list.length) {
      mount(listEl, emptyState({ iconName: 'messages', title: messages.length ? 'Bu filtrede mesaj yok' : 'Henüz mesaj yok', text: messages.length ? '' : 'Sitedeki “Proje başlat” formundan gelen mesajlar burada görünür.' }));
      return;
    }
    mount(listEl, list.map(m => h('button', {
      type: 'button', role: 'listitem', class: `inbox-item${m.status === 'new' ? ' unread' : ''}`, 'aria-current': String(selected?.id === m.id),
      onclick: () => navigate(`/messages/${m.id}`)
    },
      h('span', { class: 'top' }, h('b', { text: m.name }), h('time', { datetime: m.created_at, title: dateTime(m.created_at), text: ago(m.created_at) })),
      h('p', { text: m.project_type || m.email }),
      h('p', { text: m.message }))));
  }

  async function setStatus(m, status, msg) {
    try {
      const r = await services.messages.setStatus(m.id, status);
      messages = messages.map(x => (x.id === m.id ? r : x)); selected = r;
      refreshCounts(); drawTabs(); drawList(); drawDetail(); toast(msg);
    } catch (e) { toast(friendlyError(e), 'error'); }
  }

  async function remove(m) {
    const ok = await confirmDialog({ title: 'Mesaj silinsin mi?', message: `${m.name} adlı kişinin mesajı kalıcı olarak silinecek. Saklamak istiyorsan arşivleyebilirsin.`, confirmText: 'Mesajı sil' });
    if (!ok) return;
    try { await services.messages.remove(m.id); refreshCounts(); toast('Mesaj silindi.'); navigate('/messages'); }
    catch (e) { toast(friendlyError(e), 'error'); }
  }

  function drawDetail() {
    if (!selected) {
      mount(detailEl, emptyState({ iconName: 'mail', title: 'Bir mesaj seç', text: 'Okumak için soldaki listeden bir mesaja tıkla.' }));
      return;
    }
    const m = selected;
    const [label, cls] = STATUS[m.status] || ['', ''];
    const subject = encodeURIComponent(`Re: ${m.project_type || 'Proje talebiniz'}`);
    const rows = [['E-posta', h('a', { href: `mailto:${m.email}`, text: m.email })], ['Şirket', m.company], ['Proje türü', m.project_type], ['Bütçe', m.budget], ['Başlangıç', m.start_when], ['Dil', m.language === 'en' ? 'İngilizce' : 'Türkçe'], ['Tarih', dateTime(m.created_at)]]
      .filter(([, v]) => v);
    mount(detailEl,
      h('button', { class: 'btn btn-sm btn-ghost back-btn', type: 'button', onclick: () => navigate('/messages') }, '← Tüm mesajlar'),
      h('div', { class: 'row', style: { justifyContent: 'space-between' } },
        h('div', {}, h('h3', { text: m.name, style: { fontSize: '19px' } }), h('span', { class: `badge ${cls}`, text: label, style: { marginTop: '6px' } })),
        h('div', { class: 'row', style: { gap: '6px' } },
          h('a', { class: 'btn btn-primary btn-sm', href: `mailto:${m.email}?subject=${subject}` }, icon('mail', 15), 'Yanıtla'),
          m.status === 'read' ? h('button', { class: 'btn btn-sm', type: 'button', onclick: () => setStatus(m, 'new', 'Okunmadı olarak işaretlendi.') }, 'Okunmadı yap') : null,
          m.status !== 'archived'
            ? h('button', { class: 'btn btn-sm', type: 'button', onclick: () => setStatus(m, 'archived', 'Mesaj arşivlendi.') }, icon('archive', 15), 'Arşivle')
            : h('button', { class: 'btn btn-sm', type: 'button', onclick: () => setStatus(m, 'read', 'Mesaj gelen kutusuna taşındı.') }, icon('archive', 15), 'Arşivden çıkar'),
          h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Mesajı sil', title: 'Sil', onclick: () => remove(m) }, icon('trash', 16)))),
      h('dl', { class: 'kv' }, rows.flatMap(([k, v]) => [h('dt', { text: k }), h('dd', {}, v)])),
      h('div', { class: 'msg-body', text: m.message }));
  }

  mount(root,
    h('div', { class: 'page-head' },
      h('div', {}, h('h2', { text: 'Mesajlar' }), h('p', { text: 'Sitedeki iletişim formundan gelen talepler.' })),
      tabs),
    h('section', { class: 'card' },
      h('div', { class: 'toolbar' }, h('div', { class: 'search' }, icon('search', 16), search)),
      inbox));
  drawTabs(); drawList(); drawDetail();
  if (params.id && !selected) toast('Mesaj bulunamadı; silinmiş olabilir.', 'error');
}
