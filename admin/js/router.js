// Hash router (#/projects/lara): works on any static host without rewrite rules.

const ROUTES = [
  { re: /^\/$/, name: 'dashboard', title: 'Genel bakış' },
  { re: /^\/projects$/, name: 'projects', title: 'Projeler' },
  { re: /^\/projects\/new$/, name: 'projectEdit', nav: 'projects', title: 'Yeni proje', params: () => ({ id: null }) },
  { re: /^\/projects\/([a-z0-9-]+)$/, name: 'projectEdit', nav: 'projects', title: 'Projeyi düzenle', params: m => ({ id: m[1] }) },
  { re: /^\/content(?:\/([a-z]+))?$/, name: 'content', title: 'İçerik', params: m => ({ key: m[1] || 'hero' }) },
  { re: /^\/media$/, name: 'media', title: 'Medya' },
  { re: /^\/messages(?:\/([A-Za-z0-9-]+))?$/, name: 'messages', title: 'Mesajlar', params: m => ({ id: m[1] || null }) },
  { re: /^\/settings$/, name: 'settings', title: 'Ayarlar' }
];

export function resolve(hash) {
  const path = (hash || '').replace(/^#/, '').replace(/\/+$/, '') || '/';
  for (const r of ROUTES) {
    const m = path.match(r.re);
    if (m) return { name: r.name, nav: r.nav || r.name, title: r.title, params: r.params ? r.params(m) : {}, path };
  }
  return { name: 'notFound', nav: null, title: 'Sayfa bulunamadı', params: {}, path };
}

/**
 * createRouter({ onRoute(route), canLeave(): Promise<bool> })
 * canLeave lets a page with unsaved changes veto navigation; the previous hash is restored silently.
 */
export function createRouter({ onRoute, canLeave }) {
  let current = null;
  let busy = false;

  async function handle() {
    const next = location.hash || '#/';
    if (next === current || busy) return;
    if (current !== null) {
      busy = true;
      const ok = await canLeave();
      busy = false;
      if (!ok) { history.replaceState(null, '', current); return; }
    }
    current = next;
    onRoute(resolve(next));
  }

  return {
    start() { window.addEventListener('hashchange', handle); handle(); },
    stop() { window.removeEventListener('hashchange', handle); current = null; },
    navigate(path) { location.hash = path; },
    /** Re-render the current route (e.g. after saving a new project under its final id). */
    replace(path) { history.replaceState(null, '', '#' + path); current = '#' + path; onRoute(resolve('#' + path)); }
  };
}
