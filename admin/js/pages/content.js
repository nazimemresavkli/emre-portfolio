import { h, icon, mount } from '../lib/dom.js';
import { ago, dateTime } from '../lib/format.js';
import { friendlyError } from '../lib/errors.js';
import { siteOrigin } from '../lib/config.js';
import { SECTIONS, SEO_LIMITS, normalizeSection } from '../services/contentService.js';
import { bilingualField, textField, tagInput } from '../components/formField.js';
import { withBusy } from '../components/emptyState.js';
import { toast } from '../components/toast.js';

const clone = o => JSON.parse(JSON.stringify(o));
const HELP = {
  hero: 'Sitenin en üstündeki tanıtım cümlesi. **iki yıldız** arasına aldığın kısım kalın görünür.',
  about: 'Hakkımda bölümündeki büyük paragraf ve altındaki ek açıklama.',
  services: '“Neler yapıyorum” listesi. Sıra sitedekiyle aynıdır.',
  contact: 'İletişim bölümündeki giriş paragrafı.',
  seo: 'Arama sonuçlarında görünen başlık ve açıklama. Önerilen uzunluk: başlık 60, açıklama 160 karakter.',
  testimonials: 'Müşteri yorumları. Hiç referans yoksa bölüm sitede gizlenir.'
};

export async function render({ services, root, params, navigate, setDirty }) {
  const key = SECTIONS.some(s => s.key === params.key) ? params.key : 'hero';
  const all = await services.content.getAll();
  const model = clone(all[key].data);
  let baseline = '';
  let updatedAt = all[key].updatedAt;

  const form = h('form', { novalidate: true });
  const dirtyNote = h('span', { class: 'dirty-note', hidden: true, text: 'Kaydedilmemiş değişiklikler var' });
  const check = () => { const d = JSON.stringify(model) !== baseline; dirtyNote.hidden = !d; setDirty(d); };
  form.addEventListener('input', () => queueMicrotask(check));

  // ---------- tabs (each tab is its own URL, so unsaved-change protection applies when switching)
  const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'İçerik bölümleri' });
  SECTIONS.forEach((s, i) => {
    const b = h('button', { type: 'button', role: 'tab', id: `tab-${s.key}`, 'aria-selected': String(s.key === key), 'aria-controls': 'section-panel', tabindex: s.key === key ? '0' : '-1', text: s.label,
      onclick: () => { if (s.key !== key) navigate(`/content/${s.key}`); },
      onkeydown: e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = tabs.children[(i + d + SECTIONS.length) % SECTIONS.length];
        next.focus(); next.click();
      } });
    tabs.append(b);
  });

  const body = h('div', { class: 'card-body' });
  const meta = h('span', { class: 'muted', style: { fontSize: '13px' } });
  const setMeta = () => { meta.textContent = updatedAt ? `Son kayıt: ${ago(updatedAt)}` : 'Henüz kaydedilmedi (varsayılan içerik)'; meta.title = dateTime(updatedAt); };
  setMeta();

  const builders = {
    hero: () => [bilingualField({ label: 'Tanıtım cümlesi', obj: model, key: 'lede', multiline: true, rows: 4, requiredTr: true, maxLength: 300 })],
    contact: () => [bilingualField({ label: 'Giriş paragrafı', obj: model, key: 'lede', multiline: true, rows: 4, requiredTr: true, maxLength: 400 })],
    about: () => [
      bilingualField({ label: 'Tanıtım paragrafı', obj: model, key: 'statement', multiline: true, rows: 6, requiredTr: true, maxLength: 700 }),
      bilingualField({ label: 'Ek açıklama', obj: model, key: 'more', multiline: true, rows: 4, maxLength: 500, hint: 'Boş bırakırsan sitede gösterilmez.' })
    ],
    seo: () => [
      bilingualField({ label: 'Sayfa başlığı', obj: model, key: 'title', requiredTr: true, maxLength: SEO_LIMITS.title }),
      bilingualField({ label: 'Açıklama', obj: model, key: 'description', multiline: true, rows: 3, maxLength: SEO_LIMITS.description }),
      h('p', { class: 'hint', text: 'Not: Sosyal medya önizlemeleri (og: etiketleri) index.html içinde sabittir; buradaki değerler sayfa başlığını ve arama motorlarının okuduğu açıklamayı günceller.' })
    ],
    services: () => [repeatList({
      items: model.items, noun: 'hizmet', render: (s, i) => [
        bilingualField({ label: 'Başlık', obj: s, key: 'title', name: `items.${i}.title`, requiredTr: true, maxLength: 40 }),
        bilingualField({ label: 'Açıklama', obj: s, key: 'desc', multiline: true, rows: 3, name: `items.${i}.desc`, maxLength: 260 }),
        tagsEditor(s)
      ],
      blank: () => ({ title: { tr: '', en: '' }, desc: { tr: '', en: '' }, tags: [] })
    })],
    testimonials: () => [repeatList({
      items: model.items, noun: 'referans', render: (q, i) => [
        bilingualField({ label: 'Alıntı', obj: q, key: 'quote', multiline: true, rows: 3, name: `items.${i}.quote`, requiredTr: true, maxLength: 400 }),
        h('div', { class: 'form-grid' },
          textField({ label: 'İsim', obj: q, key: 'name', name: `items.${i}.name` }),
          textField({ label: 'Şirket', obj: q, key: 'company', name: `items.${i}.company` })),
        bilingualField({ label: 'Unvan', obj: q, key: 'role', name: `items.${i}.role` })
      ],
      blank: () => ({ quote: { tr: '', en: '' }, name: '', role: { tr: '', en: '' }, company: '' })
    })]
  };

  /** Ordered, add/remove/move list whose items render through `render(item, i)`. */
  function repeatList({ items, noun, render: renderItem, blank }) {
    const box = h('div', { class: 'repeat' });
    const draw = () => {
      box.replaceChildren(...items.map((it, i) => h('div', { class: 'repeat-item' },
        h('div', { class: 'repeat-head' },
          h('b', { text: `${i + 1}. ${noun}` }),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': `${i + 1}. ${noun}: yukarı taşı`, disabled: i === 0, onclick: () => { items.splice(i - 1, 0, items.splice(i, 1)[0]); draw(); check(); } }, icon('up', 16)),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': `${i + 1}. ${noun}: aşağı taşı`, disabled: i === items.length - 1, onclick: () => { items.splice(i + 1, 0, items.splice(i, 1)[0]); draw(); check(); } }, icon('down', 16)),
          h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': `${i + 1}. ${noun}: kaldır`, onclick: () => { items.splice(i, 1); draw(); check(); } }, icon('trash', 16))),
        renderItem(it, i))),
        items.length ? '' : h('p', { class: 'muted', text: `Henüz ${noun} yok.` }),
        h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { items.push(blank()); draw(); check(); box.querySelector('.repeat-item:last-of-type input, .repeat-item:last-of-type textarea')?.focus(); } }, icon('plus', 15), `${noun[0].toUpperCase() + noun.slice(1)} ekle`));
    };
    draw();
    return box;
  }

  /** Service tags: stored as [{tr,en}] or plain strings (brand names); edited as two parallel chip lists. */
  function tagsEditor(s) {
    const trList = s.tags.map(t => (typeof t === 'string' ? t : t.tr));
    const enList = s.tags.map(t => (typeof t === 'string' ? t : t.en || t.tr));
    const sync = () => {
      const n = Math.max(trList.length, enList.length);
      s.tags = Array.from({ length: n }, (_, i) => {
        const a = trList[i] || enList[i] || '', b = enList[i] || trList[i] || '';
        return a === b ? a : { tr: a, en: b };
      });
      check();
    };
    return h('div', { class: 'field' },
      h('div', { class: 'bi' },
        tagInput({ label: 'Etiketler (TR)', values: trList, onChange: sync }),
        tagInput({ label: 'Etiketler (EN)', values: enList, onChange: sync })),
      h('div', { class: 'hint', text: 'Aynı sırayla eşleşir; marka adları gibi çevrilmeyen etiketleri yalnızca bir tarafa yazman yeterli.' }));
  }

  body.append(...builders[key]());

  const saveBtn = h('button', { class: 'btn btn-primary', type: 'submit', text: 'Kaydet' });
  const errorBox = h('div', { class: 'form-error', role: 'alert', hidden: true });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.hidden = true;
    const { error } = normalizeSection(key, model);
    if (error) { errorBox.textContent = error; errorBox.hidden = false; errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    await withBusy(saveBtn, async () => {
      try {
        const saved = await services.content.save(key, model);
        updatedAt = saved.updatedAt; setMeta();
        baseline = JSON.stringify(model); check();
        toast(`${SECTIONS.find(s => s.key === key).label} kaydedildi. Site güncellendi.`);
      } catch (err) { errorBox.textContent = friendlyError(err); errorBox.hidden = false; }
    }, 'Kaydediliyor…');
  });
  const onKey = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); form.requestSubmit(); } };
  document.addEventListener('keydown', onKey);

  mount(form,
    h('div', { class: 'page-head' },
      h('div', {}, h('h2', { text: 'İçerik' }), h('p', { text: 'Sitedeki metinler. Her bölüm ayrı kaydedilir; Türkçe ve İngilizce birlikte düzenlenir.' })),
      h('div', { class: 'page-actions' }, h('a', { class: 'btn', href: siteOrigin() + '/', target: '_blank', rel: 'noopener' }, icon('external', 16), 'Siteyi aç'))),
    tabs,
    h('section', { class: 'card', id: 'section-panel', role: 'tabpanel', 'aria-labelledby': `tab-${key}` },
      h('div', { class: 'card-head' }, h('div', {}, h('h3', { text: SECTIONS.find(s => s.key === key).label }), h('p', { class: 'muted', style: { fontSize: '13px', marginTop: '2px' }, text: HELP[key] })), meta),
      body),
    h('div', { class: 'sticky-actions' }, dirtyNote, errorBox, saveBtn));
  mount(root, form);
  baseline = JSON.stringify(model);

  return () => document.removeEventListener('keydown', onKey);
}
