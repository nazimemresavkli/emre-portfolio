import { h, icon, mount } from '../lib/dom.js';
import { bytes, ago, dateTime } from '../lib/format.js';
import { mediaSrc } from '../lib/config.js';
import { friendlyError } from '../lib/errors.js';
import { ACCEPTED_TYPES } from '../lib/image.js';
import { emptyState } from '../components/emptyState.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export async function render({ services, root }) {
  let [items, projects] = await Promise.all([services.media.list(), services.projects.list()]);
  let filter = 'all';

  const grid = h('div', {});
  const progress = h('div', { class: 'uploads', 'aria-live': 'polite' });
  const fileInput = h('input', { type: 'file', accept: ACCEPTED_TYPES.join(','), multiple: true, hidden: true, onchange: () => upload([...fileInput.files]) });
  const drop = h('div', { class: 'dropzone', role: 'button', tabindex: '0', 'aria-label': 'Görsel yükle: dosya seçmek için Enter’a bas ya da dosyaları buraya sürükle',
    onclick: () => fileInput.click(),
    onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } },
    ondragover: e => { e.preventDefault(); drop.classList.add('over'); },
    ondragleave: () => drop.classList.remove('over'),
    ondrop: e => { e.preventDefault(); drop.classList.remove('over'); upload([...e.dataTransfer.files]); } },
    icon('upload', 26), h('b', { text: 'Görselleri buraya sürükle ya da tıklayıp seç' }),
    h('span', { text: 'PNG, JPG, WebP veya GIF · en fazla 10 MB. Yüklerken otomatik olarak WebP’ye çevrilir ve küçültülür.' }));

  async function upload(files) {
    fileInput.value = '';
    for (const file of files) {
      const row = h('div', { class: 'upload-row' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), h('span', { class: 'grow', text: file.name }), h('span', { class: 'muted', text: bytes(file.size) }));
      progress.append(row);
      try {
        const item = await services.media.upload(file);
        items = [item, ...items];
        draw();
        row.replaceChildren(icon('check', 16), h('span', { class: 'grow', text: `${file.name} yüklendi (${bytes(item.size_bytes)})` }));
        setTimeout(() => row.remove(), 3000);
      } catch (e) {
        row.replaceChildren(icon('alert', 16), h('span', { class: 'grow', text: `${file.name}: ${friendlyError(e)}` }),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Kapat', onclick: () => row.remove() }, icon('close', 15)));
        row.style.color = 'var(--danger)';
      }
    }
  }

  async function copy(item) {
    const url = services.media.absoluteUrl(item);
    try { await navigator.clipboard.writeText(url); toast('Adres kopyalandı.'); }
    catch {
      // Clipboard API needs a secure context; fall back to a selectable field.
      const input = h('input', { class: 'input mono', value: url, readOnly: true });
      openModal({ title: 'Görsel adresi', body: h('div', { class: 'field' }, h('label', { text: 'Kopyalamak için seç' }), input) });
      input.select();
    }
  }

  async function editAlt(item) {
    const input = h('input', { class: 'input', value: item.alt || '', maxlength: 200 });
    const save = h('button', { class: 'btn btn-primary', type: 'button', text: 'Kaydet' });
    const m = openModal({ title: 'Açıklama (alternatif metin)', body: h('div', { class: 'field' }, h('label', { text: 'Görseli kısaca tarif et' }), input, h('div', { class: 'hint', text: 'Kütüphanede aramayı ve tanımayı kolaylaştırır.' })),
      actions: [h('button', { class: 'btn', type: 'button', text: 'Vazgeç', onclick: () => m.close() }), save] });
    input.focus();
    save.onclick = async () => {
      try { const r = await services.media.updateAlt(item.id, input.value); items = items.map(x => (x.id === item.id ? r : x)); draw(); m.close(); toast('Açıklama kaydedildi.'); }
      catch (e) { toast(friendlyError(e), 'error'); }
    };
  }

  async function remove(item) {
    const used = services.media.usage(item, projects);
    const ok = await confirmDialog({
      title: 'Görsel silinsin mi?',
      message: used.length
        ? `Bu görsel şu projelerde kullanılıyor: ${used.join(', ')}. Silersen o kartlarda görsel görünmez. Yine de silinsin mi?`
        : 'Görsel kütüphaneden ve depolamadan kalıcı olarak silinecek.',
      confirmText: used.length ? 'Yine de sil' : 'Sil'
    });
    if (!ok) return;
    try { await services.media.remove(item); items = items.filter(x => x.id !== item.id); draw(); toast('Görsel silindi.'); }
    catch (e) { toast(friendlyError(e), 'error'); }
  }

  const tabs = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Kaynağa göre filtrele' });
  const drawTabs = () => tabs.replaceChildren(...[['all', 'Tümü'], ['storage', 'Yüklenenler'], ['builtin', 'Site dosyaları']].map(([v, t]) => h('button', {
    type: 'button', role: 'radio', 'aria-checked': String(filter === v), 'aria-pressed': String(filter === v), text: t, onclick: () => { filter = v; drawTabs(); draw(); } })));
  drawTabs();

  function draw() {
    const list = items.filter(i => filter === 'all' || i.kind === filter);
    if (!list.length) {
      mount(grid, emptyState({ iconName: 'image', title: filter === 'storage' ? 'Henüz görsel yüklenmedi' : 'Görsel yok', text: 'Yukarıdaki alana sürükleyerek ilk görselini yükle.' }));
      return;
    }
    mount(grid, h('div', { class: 'media-grid' }, list.map(it => {
      const used = services.media.usage(it, projects);
      const name = it.alt || it.path.split('/').pop();
      return h('article', { class: 'card media-card' },
        h('div', { class: 'preview' }, h('img', { src: mediaSrc(it.url), alt: it.alt || '', loading: 'lazy' }),
          h('span', { class: `badge ${it.kind === 'builtin' ? '' : 'badge-new'}`, text: it.kind === 'builtin' ? 'Site dosyası' : 'Yüklendi' })),
        h('div', { class: 'meta' },
          h('b', { title: name, text: name }),
          h('span', { text: `${it.width || '?'}×${it.height || '?'} · ${bytes(it.size_bytes)}` }),
          h('span', { title: dateTime(it.created_at), text: used.length ? `Kullanıldığı yer: ${used.join(', ')}` : it.kind === 'builtin' ? 'Hiçbir projede değil' : `Yüklendi ${ago(it.created_at)}` })),
        h('div', { class: 'acts' },
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': `${name} adresini kopyala`, title: 'Adresi kopyala', onclick: () => copy(it) }, icon('copy', 16)),
          h('a', { class: 'icon-btn', href: mediaSrc(it.url), target: '_blank', rel: 'noopener', 'aria-label': `${name} görselini yeni sekmede aç`, title: 'Yeni sekmede aç' }, icon('external', 16)),
          it.kind === 'storage' ? h('button', { class: 'icon-btn', type: 'button', 'aria-label': `${name} açıklamasını düzenle`, title: 'Açıklamayı düzenle', onclick: () => editAlt(it) }, icon('edit', 16)) : null,
          it.kind === 'storage' ? h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': `${name} sil`, title: 'Sil', style: { marginLeft: 'auto' }, onclick: () => remove(it) }, icon('trash', 16)) : null));
    })));
  }

  mount(root,
    h('div', { class: 'page-head' },
      h('div', {}, h('h2', { text: 'Medya' }), h('p', { text: 'Projelerde kullanılan görseller. Yüklenen dosyalar herkese açık bir adresten sunulur.' })),
      tabs),
    h('div', { class: 'stack' }, h('div', {}, drop, fileInput, progress), grid));
  draw();
}
