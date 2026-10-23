import { h, icon, mount } from '../lib/dom.js';
import { CATALOG, SOCIALS, STATUSES } from '../lib/config.js';
import { friendlyError } from '../lib/errors.js';
import { applyTheme, THEME_LABELS } from '../lib/theme.js';
import { validateSettings } from '../services/settingsService.js';
import { textField, bilingualField, showErrors, segmented, swatchPicker, field } from '../components/formField.js';
import { withBusy } from '../components/emptyState.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { toast } from '../components/toast.js';
import { state, setState } from '../state.js';

export async function render({ services, root, setDirty, replaceRoute }) {
  const original = await services.settings.get();
  const model = JSON.parse(JSON.stringify(original));
  model.socials = { ...model.socials };
  let baseline = '';

  const form = h('form', { novalidate: true });
  const dirtyNote = h('span', { class: 'dirty-note', hidden: true, text: 'Kaydedilmemiş değişiklikler var' });
  const check = () => { const d = JSON.stringify(model) !== baseline; dirtyNote.hidden = !d; setDirty(d); };
  form.addEventListener('input', () => queueMicrotask(check));

  const card = (title, desc, ...children) => h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('div', {}, h('h3', { text: title }), desc ? h('p', { class: 'muted', style: { fontSize: '13px', marginTop: '2px' }, text: desc }) : null)),
    h('div', { class: 'card-body' }, children));

  const availability = bilingualField({ label: 'Ne zaman müsait olacaksın?', obj: model, key: 'availableFrom', hint: 'Durum “Sınırlı” veya “Meşgul” iken saat yerine gösterilir, örn. “Ocak 2027”.' });
  availability.hidden = model.status === 'available';

  const site = card('Site', 'Sitenin üst kısmındaki durum rozeti ve iletişim bilgileri.',
    h('div', { class: 'field' }, h('span', { class: 'field-label', text: 'Çalışma durumu' }),
      segmented({ label: 'Çalışma durumu', options: STATUSES, value: model.status, onChange: v => { model.status = v; availability.hidden = v === 'available'; check(); } })),
    availability,
    h('div', { class: 'form-grid' },
      textField({ label: 'İletişim e-postası', obj: model, key: 'email', type: 'email', autocomplete: 'email', hint: 'Sitedeki e-posta bağlantıları ve kopyala düğmesi bunu kullanır.' }),
      textField({ label: 'LinkedIn', obj: model, key: 'linkedin', type: 'url', placeholder: 'https://www.linkedin.com/in/…' })));

  const socials = card('Sosyal linkler', 'Doldurduğun profiller sitenin alt kısmında LinkedIn’in yanında listelenir. Boş bırakılanlar gösterilmez.',
    h('div', { class: 'form-grid' }, SOCIALS.map(([k, label]) =>
      textField({ label, obj: model.socials, key: k, name: `socials.${k}`, type: 'url', placeholder: 'https://…' }))));

  const formCard = card('İletişim formu', null,
    textField({ label: 'web3forms erişim anahtarı', obj: model, key: 'formAccessKey', autocomplete: 'off',
      hint: 'İsteğe bağlı. Doluysa formdan gelen mesajlar e-postana da gönderilir (web3forms.com). Mesajlar her durumda Mesajlar sayfasına düşer.' }));

  const themeHint = h('div', { class: 'hint' });
  const setThemeHint = () => { themeHint.textContent = `Şu an: ${THEME_LABELS[model.adminTheme]}. Değişiklik hemen önizlenir; kalıcı olması için kaydet.`; };
  setThemeHint();
  const look = card('Görünüm', 'Sitenin renk paleti sabittir; buradaki ayarlar yalnızca paneli ve yeni projelerin başlangıç temasını etkiler.',
    h('div', { class: 'field' }, h('span', { class: 'field-label', text: 'Panel teması' }),
      segmented({ label: 'Panel teması', options: Object.entries(THEME_LABELS), value: model.adminTheme, onChange: v => { model.adminTheme = v; applyTheme(v); setThemeHint(); check(); } }),
      themeHint),
    h('div', { class: 'field' }, h('span', { class: 'field-label', text: 'Yeni projeler için varsayılan kart teması' }),
      swatchPicker({ label: 'Varsayılan kart teması', themes: CATALOG.themes || {}, value: model.defaultProjectTheme, onChange: v => { model.defaultProjectTheme = v; check(); } })));

  const account = services.mode === 'demo'
    ? card('Demo modu', 'Supabase bağlı değil; tüm değişiklikler bu tarayıcıda saklanıyor. Gerçek kurulum için admin/README.md’ye bak.',
        h('div', {}, h('button', { class: 'btn btn-danger', type: 'button', onclick: resetDemo }, icon('refresh', 16), 'Demo verisini sıfırla')))
    : card('Hesap', null, field({ label: 'Giriş yapılan hesap', control: h('input', { class: 'input', value: state.user?.email || '', readOnly: true }) }),
        h('p', { class: 'hint', text: 'Şifre değişikliği ve yeni yönetici ekleme Supabase panelinden yapılır (Authentication → Users ve admins tablosu).' }));

  async function resetDemo() {
    const ok = await confirmDialog({ title: 'Demo verisi sıfırlansın mı?', message: 'Bu tarayıcıda yaptığın tüm demo değişiklikleri silinir ve sitenin varsayılan içeriği geri gelir.', confirmText: 'Sıfırla' });
    if (!ok) return;
    services.resetDemo();
    setDirty(false);
    location.reload();
  }

  const saveBtn = h('button', { class: 'btn btn-primary', type: 'submit', text: 'Ayarları kaydet' });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!showErrors(form, validateSettings(model))) { toast('Kaydetmeden önce işaretli alanları düzelt.', 'error'); return; }
    await withBusy(saveBtn, async () => {
      try {
        const saved = await services.settings.save(model);
        baseline = JSON.stringify(model); setDirty(false);
        setState({ settings: saved });
        toast('Ayarlar kaydedildi.');
        replaceRoute('/settings'); // re-bind every field to the stored (trimmed) values
      } catch (err) { toast(friendlyError(err), 'error'); }
    }, 'Kaydediliyor…');
  });
  const onKey = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); form.requestSubmit(); } };
  document.addEventListener('keydown', onKey);

  mount(form,
    h('div', { class: 'page-head' }, h('div', {}, h('h2', { text: 'Ayarlar' }), h('p', { text: 'Site bilgileri, sosyal linkler ve panel tercihleri.' }))),
    h('div', { class: 'stack' }, site, socials, formCard, look, account),
    h('div', { class: 'sticky-actions' }, dirtyNote, saveBtn));
  mount(root, form);
  baseline = JSON.stringify(model);

  return () => {
    document.removeEventListener('keydown', onKey);
    // Leaving without saving: drop the theme preview.
    if (JSON.stringify(model) !== baseline) applyTheme(state.settings?.adminTheme || original.adminTheme);
  };
}
