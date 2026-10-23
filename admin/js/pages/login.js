import { h, icon, mount } from '../lib/dom.js';
import { friendlyError } from '../lib/errors.js';
import { field } from '../components/formField.js';
import { withBusy } from '../components/emptyState.js';

/** Full-screen login (Supabase mode only). Calls onSuccess(user) once the account is confirmed as admin. */
export function renderLogin(root, { services, message = '', onSuccess }) {
  document.title = 'Giriş — Yönetim paneli';
  const email = h('input', { class: 'input', type: 'email', autocomplete: 'username', required: true, autofocus: true });
  const pass = h('input', { class: 'input', type: 'password', autocomplete: 'current-password', required: true });
  const reveal = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Şifreyi göster', 'aria-pressed': 'false', onclick: () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    reveal.setAttribute('aria-pressed', String(show));
    reveal.setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
    reveal.replaceChildren(icon(show ? 'eyeOff' : 'eye'));
  } }, icon('eye'));
  const error = h('div', { class: 'form-error', role: 'alert', hidden: !message, text: message });
  const submit = h('button', { class: 'btn btn-primary', type: 'submit', text: 'Giriş yap' });

  const form = h('form', { class: 'card login-card', novalidate: true, onsubmit: async e => {
    e.preventDefault();
    error.hidden = true;
    if (!email.value.trim() || !pass.value) { show('E-posta ve şifre gerekli.'); (email.value.trim() ? pass : email).focus(); return; }
    await withBusy(submit, async () => {
      try {
        const user = await services.auth.signIn(email.value.trim(), pass.value);
        if (!(await services.auth.isAdmin())) {
          await services.auth.signOut();
          show('Bu hesabın panel yetkisi yok. Yöneticiler tablosuna eklenmiş bir hesapla giriş yap.');
          return;
        }
        onSuccess(user);
      } catch (err) {
        show(friendlyError(err));
        pass.select();
      }
    }, 'Giriş yapılıyor…');
  } },
    h('div', { class: 'brand' }, h('span', { class: 'brand-mark', text: 'NE' }), h('span', {}, 'Emre Şavklı', h('small', { text: 'Yönetim paneli' }))),
    h('div', {}, h('h1', { text: 'Giriş yap' }), h('p', { class: 'muted', text: 'Panele yalnızca yönetici hesapları girebilir.' })),
    error,
    field({ label: 'E-posta', control: email }),
    field({ label: 'Şifre', control: h('div', { class: 'pw-wrap' }, pass, reveal) }),
    submit);

  // field() wired the label to the wrapper div; point it at the real password input.
  form.querySelectorAll('label')[1].htmlFor = pass.id || (pass.id = 'login-password');

  function show(msg) { error.textContent = msg; error.hidden = false; }

  mount(root, h('div', { class: 'login' }, form));
  email.focus();
}
