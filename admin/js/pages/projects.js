import { h, icon, mount } from '../lib/dom.js';
import { tr, ago, dateTime } from '../lib/format.js';
import { CATALOG, BADGES, mediaSrc } from '../lib/config.js';
import { createDataTable } from '../components/dataTable.js';
import { emptyState } from '../components/emptyState.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { toast } from '../components/toast.js';

const badgeLabel = b => (BADGES.find(([k]) => k === b) || [, b])[1];

export async function render({ services, root, navigate }) {
  let projects = await services.projects.list();
  const filters = { q: '', status: 'all', badge: 'all', place: 'all' };

  const isFiltered = () => filters.q || filters.status !== 'all' || filters.badge !== 'all' || filters.place !== 'all';
  const visibleRows = () => projects.filter(p => {
    const q = filters.q.toLocaleLowerCase('tr');
    if (q) {
      const hay = [p.id, tr(p.name), p.name.en, tr(p.cat), p.cat.en, ...(p.tags.tr || []), ...(p.tags.en || []), ...(p.tech || [])].join(' ').toLocaleLowerCase('tr');
      if (!hay.includes(q)) return false;
    }
    if (filters.status === 'live' && !p.visible) return false;
    if (filters.status === 'draft' && p.visible) return false;
    if (filters.badge !== 'all' && (p.badge || '') !== filters.badge) return false;
    if (filters.place === 'featured' && !p.featured) return false;
    if (filters.place === 'list' && p.featured) return false;
    return true;
  });

  const thumb = p => {
    const img = (p.media || []).find(m => m.active) || (p.media || [])[0];
    if (img) return h('img', { class: 'thumb', src: mediaSrc(img.url), alt: '', loading: 'lazy' });
    const th = CATALOG.themes?.[p.theme] || { bg: '#2135EE', fg: '#fff' };
    return h('span', { class: 'thumb-swatch', style: { background: th.bg, color: th.fg }, 'aria-hidden': 'true', text: (tr(p.name) || p.id).slice(0, 2).toUpperCase() });
  };

  async function toggleVisible(p) {
    try {
      const updated = await services.projects.setVisible(p.id, !p.visible);
      projects = projects.map(x => (x.id === p.id ? updated : x));
      refresh();
      toast(updated.visible ? `“${tr(p.name)}” yayına alındı.` : `“${tr(p.name)}” taslağa alındı.`);
    } catch (e) { toast(e.message, 'error'); }
  }

  async function remove(p) {
    const ok = await confirmDialog({ title: 'Proje silinsin mi?', message: `“${tr(p.name) || p.id}” kalıcı olarak silinecek. Bu işlem geri alınamaz. Sadece gizlemek istiyorsan taslağa alabilirsin.`, confirmText: 'Projeyi sil' });
    if (!ok) return;
    try {
      await services.projects.remove(p.id);
      projects = projects.filter(x => x.id !== p.id);
      refresh();
      toast('Proje silindi.');
    } catch (e) { toast(e.message, 'error'); }
  }

  const table = createDataTable({
    caption: 'Projeler',
    rowKey: p => p.id,
    reorder: {
      enabled: () => !isFiltered(),
      onReorder: async ids => {
        await services.projects.reorder(ids);
        projects = ids.map((id, i) => ({ ...projects.find(p => p.id === id), sortOrder: i + 1 }));
        toast('Sıralama kaydedildi. Sitede bu sırayla görünecek.');
      }
    },
    columns: [
      { key: 'name', label: 'Proje', sortable: true, sortValue: p => tr(p.name),
        render: p => h('div', { class: 'name-cell' }, thumb(p), h('div', {}, h('a', { href: `#/projects/${p.id}`, text: tr(p.name) || p.id }), h('small', { text: tr(p.cat) || '—' }))) },
      { key: 'visible', label: 'Durum', sortable: true, sortValue: p => (p.visible ? 0 : 1),
        render: p => h('span', { class: `badge ${p.visible ? 'badge-live' : 'badge-draft'}`, text: p.visible ? 'Yayında' : 'Taslak' }) },
      { key: 'badge', label: 'Rozet', className: 'hide-sm', sortable: true, sortValue: p => badgeLabel(p.badge || ''), render: p => badgeLabel(p.badge || '') },
      { key: 'featured', label: 'Yerleşim', className: 'hide-sm', render: p => (p.featured ? 'Büyük kart' : 'Liste') },
      { key: 'updatedAt', label: 'Güncellendi', className: 'hide-sm', sortable: true, sortValue: p => -new Date(p.updatedAt || 0),
        render: p => h('time', { datetime: p.updatedAt || '', title: dateTime(p.updatedAt), text: ago(p.updatedAt) }) },
      { key: 'actions', label: 'İşlemler', className: 'cell-actions',
        render: p => h('div', {},
          h('a', { class: 'icon-btn', href: `#/projects/${p.id}`, 'aria-label': `${tr(p.name)} düzenle`, title: 'Düzenle' }, icon('edit')),
          h('button', { class: 'icon-btn act-visible', type: 'button', 'aria-label': p.visible ? `${tr(p.name)} taslağa al` : `${tr(p.name)} yayına al`, title: p.visible ? 'Taslağa al' : 'Yayına al', onclick: () => toggleVisible(p) }, icon(p.visible ? 'eyeOff' : 'eye')),
          h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': `${tr(p.name)} sil`, title: 'Sil', onclick: () => remove(p) }, icon('trash'))) }
    ],
    empty: () => projects.length
      ? emptyState({ iconName: 'search', title: 'Eşleşen proje yok', text: 'Aramayı ya da filtreleri değiştir.', action: h('button', { class: 'btn', type: 'button', text: 'Filtreleri temizle', onclick: clearFilters }) })
      : emptyState({ iconName: 'projects', title: 'Henüz proje yok', text: 'İlk projeni ekleyerek başla.', action: h('a', { class: 'btn btn-primary', href: '#/projects/new' }, icon('plus', 16), 'Proje ekle') })
  });
  table.el.addEventListener('reorder-error', e => toast('Sıralama kaydedilemedi: ' + e.detail.message, 'error'));

  const search = h('input', { class: 'input', type: 'search', placeholder: 'Ad, kategori, etiket veya teknoloji ara', 'aria-label': 'Projelerde ara',
    oninput: () => { filters.q = search.value.trim(); refresh(); } });
  const select = (key, label, options) => {
    const s = h('select', { class: 'select', 'aria-label': label, style: { width: 'auto' }, onchange: () => { filters[key] = s.value; refresh(); } },
      options.map(([v, t]) => h('option', { value: v, text: t })));
    return s;
  };
  const selStatus = select('status', 'Duruma göre filtrele', [['all', 'Tüm durumlar'], ['live', 'Yayında'], ['draft', 'Taslak']]);
  const selBadge = select('badge', 'Rozete göre filtrele', [['all', 'Tüm rozetler'], ...BADGES]);
  const selPlace = select('place', 'Yerleşime göre filtrele', [['all', 'Tüm yerleşimler'], ['featured', 'Büyük kart'], ['list', 'Liste']]);
  const foot = h('div', { class: 'table-foot', 'aria-live': 'polite' });

  function clearFilters() {
    Object.assign(filters, { q: '', status: 'all', badge: 'all', place: 'all' });
    search.value = ''; selStatus.value = 'all'; selBadge.value = 'all'; selPlace.value = 'all';
    refresh();
  }

  function refresh() {
    const rows = visibleRows();
    table.setRows(rows);
    const hint = isFiltered() || table.sort.key
      ? ' · Sürükleyerek sıralamak için filtreleri ve sütun sıralamasını kaldır.'
      : ' · Satırları tutamaçtan sürükle ya da tutamaca odaklanıp ↑/↓ tuşlarını kullan.';
    foot.textContent = `${projects.length} projeden ${rows.length} gösteriliyor${hint}`;
  }
  // Column sorting is internal to the table; keep the hint in sync.
  table.el.addEventListener('click', e => { if (e.target.closest('th button')) refresh(); });

  mount(root,
    h('div', { class: 'page-head' },
      h('div', {}, h('h2', { text: 'Projeler' }), h('p', { text: 'Sitedeki iş kartları. Sıra, sitedeki görünüm sırasıdır.' })),
      h('div', { class: 'page-actions' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: () => navigate('/projects/new') }, icon('plus', 16), 'Yeni proje'))),
    h('section', { class: 'card' },
      h('div', { class: 'toolbar' }, h('div', { class: 'search' }, icon('search', 16), search), selStatus, selBadge, selPlace),
      table.el,
      foot));
  refresh();
}
