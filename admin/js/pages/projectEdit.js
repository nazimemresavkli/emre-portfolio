import { h, icon, mount, nextId } from '../lib/dom.js';
import { tr, slugify, bytes } from '../lib/format.js';
import { CATALOG, MOCKS, FRAMES, BADGES, mediaSrc, siteOrigin } from '../lib/config.js';
import { friendlyError } from '../lib/errors.js';
import { blankProject, validateProject } from '../services/projectsService.js';
import { field, bilingualField, toggleField, tagInput, showErrors, segmented, swatchPicker } from '../components/formField.js';
import { emptyState, withBusy, loadingState } from '../components/emptyState.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

const DEFAULT_FACTS = () => [
  { l: { tr: 'Rol', en: 'Role' }, v: { tr: '', en: '' } },
  { l: { tr: 'Teknolojiler', en: 'Stack' }, v: { tr: '', en: '' } },
  { l: { tr: 'Kapsam', en: 'Scope' }, v: { tr: '', en: '' } }
];
const clone = o => JSON.parse(JSON.stringify(o));

export async function render(ctx) {
  const { services, root, params, setDirty, setTitle, navigate, replaceRoute } = ctx;
  const isNew = !params.id;
  let original;
  if (isNew) {
    const settings = await services.settings.get().catch(() => null);
    original = { ...blankProject(settings?.defaultProjectTheme || 'cobalt'), facts: DEFAULT_FACTS() };
  } else {
    original = await services.projects.get(params.id);
    if (!original) {
      mount(root, emptyState({ iconName: 'alert', title: 'Proje bulunamadı', text: `“${params.id}” adlı bir proje yok. Silinmiş olabilir.`, action: h('a', { class: 'btn', href: '#/projects', text: 'Projelere dön' }) }));
      return;
    }
  }
  const model = clone(original);
  let baseline = '';
  let slugTouched = !isNew;
  setTitle(isNew ? 'Yeni proje' : tr(model.name) || model.id);

  const form = h('form', { novalidate: true });
  const dirtyNote = h('span', { class: 'dirty-note', hidden: true, text: 'Kaydedilmemiş değişiklikler var' });
  const check = () => { const d = JSON.stringify(model) !== baseline; dirtyNote.hidden = !d; setDirty(d); };
  form.addEventListener('input', () => queueMicrotask(check));
  form.addEventListener('change', () => queueMicrotask(check));

  const card = (title, desc, ...children) => h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('div', {}, h('h3', { text: title }), desc ? h('p', { class: 'muted', style: { fontSize: '13px', marginTop: '2px' }, text: desc }) : null)),
    h('div', { class: 'card-body' }, children));

  // ---------------- basics
  const slugInput = h('input', { class: 'input mono', type: 'text', value: model.id, readOnly: !isNew, autocomplete: 'off', spellcheck: 'false',
    oninput: () => { slugTouched = true; model.id = slugInput.value.trim().toLowerCase(); } });
  const basics = card('Temel bilgiler', null,
    bilingualField({ label: 'Proje adı', obj: model, key: 'name', requiredTr: true, maxLength: 80, onChange: () => {
      if (isNew && !slugTouched) { model.id = slugify(model.name.tr); slugInput.value = model.id; }
      setTitle(tr(model.name) || (isNew ? 'Yeni proje' : model.id));
    } }),
    field({ label: 'Kısa ad (adres kimliği)', name: 'id', control: slugInput,
      hint: isNew ? `Sitede bağlantı olarak kullanılır: ${siteOrigin()}/#case-${model.id || 'kisa-ad'}. Kaydettikten sonra değiştirilemez.` : 'Sitedeki bağlantılar bozulmasın diye kısa ad değiştirilemez.' }),
    bilingualField({ label: 'Kategori', obj: model, key: 'cat', hint: 'Kartın üstündeki kısa tanım, örn. “Perakende operasyon platformu”.' }),
    bilingualField({ label: 'Açıklama', obj: model, key: 'desc', multiline: true, rows: 4, maxLength: 600, hint: 'Yayındaki projeler için Türkçe açıklama zorunlu.' }));

  // ---------------- publishing & look
  const themePicker = swatchPicker({ label: 'Kart teması', themes: CATALOG.themes || {}, value: model.theme, onChange: v => { model.theme = v; check(); } });
  const mockSelect = h('select', { class: 'select', onchange: () => { model.mock = mockSelect.value; } },
    h('option', { value: '', text: 'Yok' }), MOCKS.map(m => h('option', { value: m, text: m, selected: model.mock === m })));
  const look = card('Yayın ve görünüm', null,
    h('div', { class: 'form-grid' },
      toggleField({ label: 'Yayında', obj: model, key: 'visible', hint: 'Kapalıysa proje taslaktır ve sitede görünmez.', onChange: check }),
      toggleField({ label: 'Büyük kart olarak göster', obj: model, key: 'featured', hint: 'Kapalıysa “Ayrıca geliştirdiklerim” listesinde yer alır.', onChange: check })),
    h('div', { class: 'field' }, h('span', { class: 'field-label', text: 'Rozet' }),
      segmented({ label: 'Rozet', options: BADGES, value: model.badge || '', onChange: v => { model.badge = v; check(); } }),
      h('div', { class: 'hint', text: 'Kartın köşesindeki etiket: sitede “Yayında”, “Yayında · günlük kullanımda” veya “Konsept” olarak görünür.' })),
    h('div', { class: 'field' }, h('span', { class: 'field-label', text: 'Kart teması' }), themePicker,
      h('div', { class: 'hint', text: 'Sitenin renk paleti sabittir; burada yalnızca bu kartın hazır temalardan hangisini kullanacağını seçersin.' })),
    field({ label: 'Hazır HTML mockup', control: mockSelect, hint: 'Projede görsel yoksa sahnede bu mockup gösterilir.' }));

  // ---------------- tags
  const tags = card('Etiketler', 'Kartta açıklamanın altında görünen kısa etiketler.',
    h('div', { class: 'bi' },
      tagInput({ label: 'Türkçe etiketler', values: model.tags.tr, onChange: check }),
      tagInput({ label: 'İngilizce etiketler', values: model.tags.en, onChange: check })));

  // ---------------- facts (Rol / Teknolojiler / Kapsam …)
  const factsBox = h('div', { class: 'repeat' });
  const renderFacts = () => {
    factsBox.replaceChildren(...model.facts.map((f, i) => h('div', { class: 'repeat-item' },
      h('div', { class: 'repeat-head' }, h('b', { text: `${i + 1}. bilgi${i >= 3 ? ' (sitede gösterilmez)' : ''}` }),
        moveButtons(model.facts, i, () => { renderFacts(); check(); }),
        h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': `${i + 1}. bilgiyi kaldır`, onclick: () => { model.facts.splice(i, 1); renderFacts(); check(); } }, icon('trash', 16))),
      bilingualField({ label: 'Başlık', obj: f, key: 'l', name: `facts.${i}.l` }),
      bilingualField({ label: 'Değer', obj: f, key: 'v', name: `facts.${i}.v` }))),
      h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { model.facts.push({ l: { tr: '', en: '' }, v: { tr: '', en: '' } }); renderFacts(); check(); } }, icon('plus', 15), 'Bilgi ekle'));
  };
  renderFacts();
  const facts = card('Proje bilgileri', 'Kartın altındaki üç kısa bilgi (örn. Rol, Teknolojiler, Kapsam). Sitede ilk üçü gösterilir.', factsBox);

  // ---------------- tech
  const techGrid = h('div', { class: 'tech-grid' });
  for (const layer of CATALOG.layers || []) {
    const items = (CATALOG.tech || []).filter(t => t.layer === layer.id);
    if (!items.length) continue;
    techGrid.append(h('div', { class: 'tech-layer', text: tr(layer.name) }));
    for (const t of items) {
      const cb = h('input', { type: 'checkbox', checked: model.tech.includes(t.id), onchange: () => {
        model.tech = cb.checked ? [...model.tech, t.id] : model.tech.filter(x => x !== t.id); check();
      } });
      techGrid.append(h('label', { class: 'check' }, cb, typeof t.name === 'string' ? t.name : tr(t.name)));
    }
  }
  const tech = card('Teknolojiler', 'Sitedeki “Bir ürünün tüm katmanları” haritası bu seçimlere göre güncellenir.', techGrid);

  // ---------------- media
  const mediaBox = h('div', { class: 'proj-media' });
  const fileInput = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true, hidden: true, onchange: () => uploadFiles([...fileInput.files]) });
  const uploadBtn = h('button', { class: 'btn btn-sm', type: 'button', onclick: () => fileInput.click() }, icon('upload', 15), 'Görsel yükle');
  const progress = h('div', { class: 'uploads', 'aria-live': 'polite' });

  const renderMedia = () => {
    const scenes = model.media.filter(m => m.frame === 'scene');
    mediaBox.replaceChildren(...model.media.map((m, i) => {
      const frameSel = h('select', { class: 'select', 'aria-label': `${i + 1}. görselin çerçevesi`, onchange: () => { m.frame = frameSel.value; if (m.frame !== 'scene') delete m.active; renderMedia(); check(); } },
        FRAMES.map(([v, t]) => h('option', { value: v, text: t, selected: m.frame === v })));
      const activeId = nextId('act');
      return h('div', { class: 'proj-media-item' },
        h('div', {}, h('img', { src: mediaSrc(m.url), alt: '' }), i === 0 ? h('div', { class: 'cover-tag', text: 'KAPAK' }) : null),
        h('div', { class: 'fields' },
          h('div', { class: 'mono muted', style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: m.url, text: m.url.startsWith('data:') ? 'demo görseli' : m.url.split('/').pop() }),
          field({ label: 'Çerçeve', control: frameSel }),
          m.frame === 'scene' && scenes.length > 1
            ? h('div', { class: 'stack', style: { gap: '10px' } },
                bilingualField({ label: 'Sekme adı', obj: m, key: 'label', name: `media.${i}.label`, hint: 'Sitede görseller arası geçiş düğmesinde görünür (örn. Website / Dashboard).' }),
                h('label', { class: 'check', htmlFor: activeId },
                  h('input', { type: 'radio', name: 'scene-default', id: activeId, checked: !!m.active, onchange: () => { model.media.forEach(x => delete x.active); m.active = true; check(); } }),
                  'Sitede ilk bu görünüm açılsın'))
            : null),
        h('div', { class: 'move' },
          moveButtons(model.media, i, () => { renderMedia(); check(); }),
          h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': `${i + 1}. görseli projeden kaldır`, title: 'Projeden kaldır (kütüphanede kalır)', onclick: () => { model.media.splice(i, 1); renderMedia(); check(); } }, icon('trash', 16))));
    }));
    if (!model.media.length) mediaBox.append(h('p', { class: 'muted', text: 'Henüz görsel yok. Görsel yoksa sahnede hazır mockup ya da baş harfler gösterilir.' }));
  };

  // Adds library rows to the project; the first frame guess follows the old panel (landscape → browser, portrait → phone).
  const addFromLibrary = rows => {
    for (const r of rows) {
      if (model.media.some(m => m.url === r.url)) continue;
      model.media.push({ url: r.url, frame: r.width > r.height ? 'browser' : 'phone' });
    }
    renderMedia(); check();
  };

  async function uploadFiles(files) {
    fileInput.value = '';
    for (const file of files) {
      const row = h('div', { class: 'upload-row' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), h('span', { class: 'grow', text: file.name }), h('span', { class: 'muted', text: bytes(file.size) }));
      progress.append(row);
      try {
        const item = await services.media.upload(file);
        addFromLibrary([item]);
        row.replaceChildren(icon('check', 16), h('span', { class: 'grow', text: `${file.name} yüklendi` }));
        setTimeout(() => row.remove(), 2500);
      } catch (e) {
        row.replaceChildren(icon('alert', 16), h('span', { class: 'grow', text: `${file.name}: ${friendlyError(e)}` }));
        row.style.color = 'var(--danger)';
      }
    }
  }

  async function pickFromLibrary() {
    const body = h('div', {}, loadingState('Kütüphane yükleniyor…'));
    const chosen = new Set();
    const addBtn = h('button', { class: 'btn btn-primary', type: 'button', text: 'Seçilenleri ekle', disabled: true });
    const modal = openModal({ title: 'Kütüphaneden görsel seç', body, size: 'lg', actions: [h('button', { class: 'btn', type: 'button', text: 'Vazgeç', onclick: () => modal.close() }), addBtn] });
    try {
      const items = await services.media.list();
      if (!items.length) { mount(body, emptyState({ title: 'Kütüphane boş', text: 'Önce Medya sayfasından görsel yükle.' })); return; }
      mount(body, h('div', { class: 'media-grid' }, items.map(it => {
        const inProject = model.media.some(m => m.url === it.url);
        const cardEl = h('button', { type: 'button', class: 'card media-card selectable', 'aria-pressed': 'false', disabled: inProject, title: inProject ? 'Zaten projede' : '',
          onclick: () => { chosen.has(it) ? chosen.delete(it) : chosen.add(it); cardEl.classList.toggle('selected', chosen.has(it)); cardEl.setAttribute('aria-pressed', String(chosen.has(it))); addBtn.disabled = !chosen.size; addBtn.textContent = chosen.size ? `${chosen.size} görseli ekle` : 'Seçilenleri ekle'; } },
          h('div', { class: 'preview' }, h('img', { src: mediaSrc(it.url), alt: '', loading: 'lazy' }), inProject ? h('span', { class: 'badge', text: 'Projede' }) : null),
          h('div', { class: 'meta' }, h('b', { text: it.alt || it.path.split('/').pop() }), h('span', { text: `${it.width}×${it.height}` })));
        return cardEl;
      })));
      addBtn.onclick = () => { addFromLibrary([...chosen]); modal.close(); toast(`${chosen.size} görsel eklendi. Kaydetmeyi unutma.`); };
    } catch (e) { mount(body, h('p', { class: 'form-error', text: friendlyError(e) })); }
  }

  renderMedia();
  const media = card('Görseller', 'İlk görsel kapaktır (paneldeki küçük görsel). “Hazır sahne” görselleri varsa site yalnızca onları gösterir; birden fazlaysa ziyaretçi sekmelerle aralarında geçiş yapar.',
    mediaBox,
    h('div', { class: 'row' }, uploadBtn, h('button', { class: 'btn btn-sm', type: 'button', onclick: pickFromLibrary }, icon('image', 15), 'Kütüphaneden seç'), fileInput),
    progress);

  // ---------------- save / delete
  const saveBtn = h('button', { class: 'btn btn-primary', type: 'submit', text: isNew ? 'Projeyi oluştur' : 'Değişiklikleri kaydet' });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const errors = validateProject(model, { isNew });
    if (!showErrors(form, errors)) { toast('Kaydetmeden önce işaretli alanları düzelt.', 'error'); return; }
    await withBusy(saveBtn, async () => {
      try {
        if (isNew) {
          const created = await services.projects.create(model);
          baseline = JSON.stringify(model); setDirty(false);
          toast('Proje oluşturuldu.' + (created.visible ? ' Sitede yayında.' : ' Taslak olarak kaydedildi.'));
          replaceRoute(`/projects/${created.id}`);
        } else {
          const saved = await services.projects.update(model.id, model);
          baseline = JSON.stringify(model); setDirty(false);
          toast('Değişiklikler kaydedildi.' + (saved.visible ? ' Site güncellendi.' : ''));
          // Re-render from the stored row so every field is bound to the saved (normalised) data.
          replaceRoute(`/projects/${saved.id}`);
        }
      } catch (err) { toast(friendlyError(err), 'error'); }
    }, 'Kaydediliyor…');
  });

  const onKey = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); form.requestSubmit(); } };
  document.addEventListener('keydown', onKey);

  async function remove() {
    const ok = await confirmDialog({ title: 'Proje silinsin mi?', message: `“${tr(original.name) || original.id}” kalıcı olarak silinecek. Görseller medya kütüphanesinde kalır.`, confirmText: 'Projeyi sil' });
    if (!ok) return;
    try { await services.projects.remove(original.id); setDirty(false); toast('Proje silindi.'); navigate('/projects'); }
    catch (e) { toast(friendlyError(e), 'error'); }
  }

  mount(form,
    h('div', { class: 'page-head' },
      h('div', {},
        h('a', { href: '#/projects', class: 'muted', style: { fontSize: '13px', textDecoration: 'none' }, text: '← Projeler' }),
        h('h2', { text: isNew ? 'Yeni proje' : tr(original.name) || original.id, style: { marginTop: '4px' } })),
      h('div', { class: 'page-actions' },
        !isNew && original.visible ? h('a', { class: 'btn', href: `${siteOrigin()}/#case-${original.id}`, target: '_blank', rel: 'noopener' }, icon('external', 16), 'Sitede gör') : null,
        !isNew ? h('button', { class: 'btn btn-ghost btn-danger-text', type: 'button', onclick: remove }, icon('trash', 16), 'Sil') : null)),
    h('div', { class: 'stack' }, basics, look, media, tags, facts, tech),
    h('div', { class: 'sticky-actions' }, dirtyNote,
      h('button', { class: 'btn', type: 'button', text: 'Vazgeç', onclick: () => navigate('/projects') }),
      saveBtn));
  mount(root, form);
  // Fields normalise some values while building (e.g. a plain-string tab label becomes { tr, en }),
  // so the clean baseline is taken after the first render.
  baseline = JSON.stringify(model);

  return () => document.removeEventListener('keydown', onKey);
}

/** ↑/↓ buttons that move list[i]; `after` re-renders and re-checks dirtiness. */
function moveButtons(list, i, after) {
  const move = d => { const j = i + d; if (j < 0 || j >= list.length) return; list.splice(j, 0, list.splice(i, 1)[0]); after(); };
  return h('span', { style: { display: 'inline-flex' } },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Yukarı taşı', disabled: i === 0, onclick: () => move(-1) }, icon('up', 16)),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Aşağı taşı', disabled: i === list.length - 1, onclick: () => move(1) }, icon('down', 16)));
}
