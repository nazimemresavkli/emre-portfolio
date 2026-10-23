import { h, icon, mount } from '../lib/dom.js';
import { bytes, ago, dateTime } from '../lib/format.js';
import { barList, columnChart } from '../components/charts.js';

export async function render({ services, root, replaceRoute }) {
  const r = await services.reports.load();
  const P = r.projects, M = r.media, Q = r.messages;

  const tile = (label, value, note, href) => h(href ? 'a' : 'div', { class: 'card stat', href },
    h('small', { text: label }), h('b', { text: value }), h('span', { text: note }));
  const card = (title, sub, body, extra = '') => h('section', { class: `card ${extra}`, 'aria-label': title },
    h('div', { class: 'card-head' }, h('div', {}, h('h3', { text: title }), sub ? h('p', { class: 'muted', style: { fontSize: '13px', marginTop: '2px' }, text: sub }) : null)),
    h('div', { class: 'card-body' }, body));
  const sectionTitle = text => h('h3', { class: 'report-h', text });

  const weeklyRows = Q.weekly.map(w => ({ label: w.label, shortLabel: w.shortLabel, value: w.value, detail: w.partial ? `Kısmi hafta (${w.days} gün)` : '7 gün' }));

  mount(root,
    h('div', { class: 'page-head' },
      h('div', {}, h('h2', { text: 'Raporlar' }),
        h('p', { text: 'Sitedeki içerik ve iletişim formu verisinden üretilir. Ziyaretçi ve trafik analitiği için ayrıca bir sağlayıcı (Vercel Analytics, Plausible) gerekir.' })),
      h('div', { class: 'page-actions' }, h('button', { class: 'btn', type: 'button', onclick: () => replaceRoute('/reports') }, icon('refresh', 16), 'Yenile'))),

    h('div', { class: 'stats' },
      tile('Projeler', String(P.total), `${P.live} yayında · ${P.draft} taslak`, '#/projects'),
      tile('Medya', String(M.total), `${bytes(M.totalBytes)} · ${M.uploads} yüklenen`, '#/media'),
      tile('Mesajlar', String(Q.total), `son 30 günde ${Q.last30}`, '#/messages'),
      tile('Yeni mesaj', String(Q.byStatus[0].value), `${Q.byLang.tr} Türkçe · ${Q.byLang.en} İngilizce`, '#/messages')),

    sectionTitle('Projeler'),
    h('div', { class: 'grid-2' },
      card('Rozete göre', 'Kartlardaki tür etiketi', barList({ caption: 'Rozete göre projeler', rows: P.byBadge, unit: 'Proje' })),
      card('Teknoloji katmanına göre', 'Katmandan en az bir teknoloji kullanan projeler', barList({ caption: 'Teknoloji katmanına göre projeler', rows: P.byLayer, unit: 'Proje' })),
      card('En çok kullanılan teknolojiler', 'İlk 8', barList({ caption: 'En çok kullanılan teknolojiler', rows: P.topTech, unit: 'Proje' })),
      card('Yerleşim', 'Sitede nerede gösteriliyor', barList({ caption: 'Yerleşime göre projeler', rows: P.placement, unit: 'Proje' }))),

    sectionTitle('Mesajlar'),
    card('Son 30 gün, haftalık mesajlar', 'Pazartesi başlayan haftalar; ilk ve son hafta 30 günlük pencereye göre kısmi olabilir',
      columnChart({ caption: 'Son 30 günde haftalık mesaj sayısı', rows: weeklyRows, unit: 'Mesaj', note: Q.last30 ? '' : 'Son 30 günde mesaj gelmedi.' }), 'report-wide'),
    h('div', { class: 'grid-2' },
      card('Duruma göre', null, barList({ caption: 'Duruma göre mesajlar', rows: Q.byStatus, unit: 'Mesaj', empty: 'Henüz mesaj yok.' })),
      card('Proje türüne göre', 'Formda seçilen türler (bir mesajda birden fazla olabilir)', barList({ caption: 'Proje türüne göre mesajlar', rows: Q.byType, unit: 'Mesaj', empty: 'Henüz proje türü seçilmiş mesaj yok.' }))),

    sectionTitle('Medya ve içerik'),
    h('div', { class: 'grid-2' },
      card('Medya özeti', null, h('dl', { class: 'kv' },
        h('dt', { text: 'Toplam dosya' }), h('dd', { text: `${M.total} (${M.builtin} site dosyası, ${M.uploads} yüklenen)` }),
        h('dt', { text: 'Toplam boyut' }), h('dd', { text: bytes(M.totalBytes) }),
        h('dt', { text: 'Yüklenenlerin boyutu' }), h('dd', { text: bytes(M.uploadBytes) }),
        h('dt', { text: 'Kullanılmayan yüklemeler' }), h('dd', {}, M.unusedUploads ? h('a', { href: '#/media', text: `${M.unusedUploads} dosya hiçbir projede yok` }) : 'Yok')),
        h('table', { class: 'table', style: { marginTop: '8px' } },
          h('caption', { class: 'report-caption', text: 'En büyük dosyalar' }),
          h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Dosya' }), h('th', { scope: 'col', text: 'Boyut', style: { textAlign: 'right' } }))),
          h('tbody', {}, M.largest.map(f => h('tr', {}, h('td', {}, f.name, f.used ? '' : h('span', { class: 'badge', style: { marginLeft: '8px' }, text: 'kullanılmıyor' })), h('td', { class: 'num', text: bytes(f.bytes) })))))),
      card('İçerik güncelliği', 'Bölümlerin son kaydedilme zamanı', h('table', { class: 'table' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Bölüm' }), h('th', { scope: 'col', text: 'Son kayıt' }))),
        h('tbody', {}, r.freshness.map(s => h('tr', {},
          h('td', {}, h('a', { href: `#/content/${s.key}`, text: s.label })),
          h('td', { title: dateTime(s.updatedAt), text: s.updatedAt ? ago(s.updatedAt) : 'Kaydedilmedi' }))))))));
}
