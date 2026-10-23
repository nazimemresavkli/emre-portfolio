import { h, icon, mount } from './lib/dom.js';
import { applyTheme, cachedTheme, nextTheme } from './lib/theme.js';
import { friendlyError } from './lib/errors.js';
import { createServices } from './services/index.js';
import { state, setState, subscribe } from './state.js';
import { createRouter } from './router.js';
import { createSidebar } from './components/sidebar.js';
import { createTopbar } from './components/topbar.js';
import { toast } from './components/toast.js';
import { confirmDialog } from './components/confirmDialog.js';
import { loadingState, errorState, emptyState } from './components/emptyState.js';
import { renderLogin } from './pages/login.js';

const root = document.getElementById('app');
let services, router;

applyTheme(cachedTheme());
boot();

async function boot() {
  try {
    services = await createServices();
  } catch (e) {
    mount(root, h('div', { class: 'login' }, h('div', { class: 'card login-card' }, errorState(friendlyError(e), () => location.reload()))));
    return;
  }
  setState({ mode: services.mode });

  if (services.mode === 'demo') { setState({ user: await services.auth.getUser() }); return startShell(); }

  const user = await services.auth.getUser().catch(() => null);
  if (!user) return showLogin();
  if (!(await services.auth.isAdmin().catch(() => false))) {
    await services.auth.signOut().catch(() => {});
    return showLogin('Bu hesabın panel yetkisi yok. Yöneticiler tablosuna eklenmiş bir hesapla giriş yap.');
  }
  setState({ user });
  startShell();
}

function showLogin(message = '') {
  router?.stop();
  setState({ user: null, dirty: false });
  renderLogin(root, {
    services,
    message,
    onSuccess: user => { setState({ user }); startShell(); }
  });
}

// ---------------------------------------------------------------- shell
let cleanup = null;
let unsubscribe = null;
let renderSeq = 0;
let keepScrollY = null; // set by replaceRoute so an in-place re-render doesn't jump to the top

function startShell() {
  const content = h('main', { class: 'content', id: 'main', tabindex: '-1' });
  const shell = h('div', { class: 'shell' });
  const closeNav = () => { shell.classList.remove('nav-open'); topbar.menuButton.setAttribute('aria-expanded', 'false'); };
  const sidebar = createSidebar({ onNavigate: closeNav });
  const topbar = createTopbar({
    onMenu: () => {
      const open = !shell.classList.contains('nav-open');
      shell.classList.toggle('nav-open', open);
      topbar.menuButton.setAttribute('aria-expanded', String(open));
      if (open) sidebar.el.querySelector('a')?.focus();
    },
    onTheme: changeTheme,
    onLogout: logout
  });
  const backdrop = h('div', { class: 'backdrop', onclick: closeNav });
  shell.addEventListener('keydown', e => { if (e.key === 'Escape' && shell.classList.contains('nav-open')) { closeNav(); topbar.menuButton.focus(); } });

  mount(shell,
    sidebar.el, backdrop,
    h('div', { class: 'main' },
      topbar.el,
      services.mode === 'demo'
        ? h('div', { class: 'demo-banner', role: 'note' }, icon('alert', 16),
            h('span', { text: 'Demo modu: Supabase bağlı değil. Değişiklikler sadece bu tarayıcıda saklanır ve sitenin bu tarayıcıdaki önizlemesine yansır.' }))
        : null,
      content));
  mount(root, h('a', { class: 'skip-link', href: '#main', onclick: e => { e.preventDefault(); content.focus(); } }, 'İçeriğe geç'), shell);

  unsubscribe?.();
  unsubscribe = subscribe(s => { sidebar.update(s); topbar.update(s); });
  setState({});

  services.settings.get()
    .then(settings => { setState({ settings }); applyTheme(settings.adminTheme); })
    .catch(e => toast(friendlyError(e), 'error'));
  refreshCounts();

  router = createRouter({ onRoute: route => renderRoute(route, content), canLeave });
  router.start();
}

async function renderRoute(route, content) {
  const seq = ++renderSeq;
  cleanup?.(); cleanup = null;
  setState({ route, dirty: false });
  document.title = `${route.title} — Yönetim paneli`;
  refreshCounts(); // new contact-form messages show up in the sidebar badge without a reload
  mount(content, loadingState());

  if (route.name === 'notFound') {
    mount(content, emptyState({ iconName: 'alert', title: 'Sayfa bulunamadı', text: 'Aradığın sayfa yok ya da taşınmış.', action: h('a', { class: 'btn', href: '#/', text: 'Genel bakışa dön' }) }));
    return;
  }
  try {
    const page = await import(`./pages/${route.name}.js`);
    if (seq !== renderSeq) return; // user navigated again meanwhile
    // The page renders into its own container and is only swapped in if it is still the current
    // route when its data arrives, so a slow page can never overwrite the one the user moved to.
    const pageRoot = h('div', { class: 'page' });
    const current = () => seq === renderSeq;
    const ctx = {
      services, params: route.params, root: pageRoot,
      navigate: path => router.navigate(path),
      replaceRoute: path => { if (!current()) return; keepScrollY = window.scrollY; router.replace(path); },
      setTitle: title => { if (!current()) return; setState({ route: { ...state.route, title } }); document.title = `${title} — Yönetim paneli`; },
      setDirty: dirty => { if (current() && state.dirty !== dirty) setState({ dirty }); },
      refreshCounts,
      isCurrent: current
    };
    const pageCleanup = (await page.render(ctx)) || null;
    if (!current()) { pageCleanup?.(); return; }
    cleanup = pageCleanup;
    mount(content, pageRoot);
  } catch (e) {
    if (seq !== renderSeq) return;
    mount(content, errorState(friendlyError(e), () => renderRoute(route, content)));
  }
  if (seq !== renderSeq) return;
  // Move focus to the new page for screen readers, without the browser scrolling past the banner.
  window.scrollTo(0, keepScrollY ?? 0);
  keepScrollY = null;
  content.focus({ preventScroll: true });
}

async function canLeave() {
  if (!state.dirty) return true;
  const ok = await confirmDialog({ title: 'Kaydedilmemiş değişiklikler var', message: 'Bu sayfadan çıkarsan yaptığın değişiklikler kaybolacak.', confirmText: 'Kaydetmeden çık', cancelText: 'Sayfada kal' });
  if (ok) setState({ dirty: false });
  return ok;
}

window.addEventListener('beforeunload', e => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

async function refreshCounts() {
  try { setState({ newMessages: await services.messages.countNew() }); } catch { /* badge is optional */ }
}

async function changeTheme() {
  const current = state.settings?.adminTheme || cachedTheme();
  const next = nextTheme(current);
  applyTheme(next);
  setState({ settings: { ...(state.settings || {}), adminTheme: next } });
  try {
    const base = state.settings?.email ? state.settings : await services.settings.get();
    setState({ settings: await services.settings.save({ ...base, adminTheme: next }) });
  } catch (e) { toast('Tema bu cihazda uygulandı ama kaydedilemedi: ' + friendlyError(e), 'error'); }
}

async function logout() {
  if (!(await canLeave())) return;
  try { await services.auth.signOut(); } catch (e) { toast(friendlyError(e), 'error'); }
  history.replaceState(null, '', location.pathname);
  showLogin();
  toast('Çıkış yapıldı.');
}
