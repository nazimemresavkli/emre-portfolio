import { AppError } from '../../lib/errors.js';
import { blobToDataUrl } from '../../lib/image.js';

// Demo mode: config.js has no Supabase keys. Everything lives in this browser's localStorage,
// starting from demo-seed.json (generated together with supabase/seed.sql, so both start identical).
const STORE_KEY = 'cms_demo_v1';
// The public site (app.js) reads this key when Supabase is not configured, so demo edits can be previewed locally.
const PREVIEW_KEY = 'demo_content';
const SEED_URL = new URL('./demo-seed.json', import.meta.url);

const KEYS = { projects: 'id', content_sections: 'key', settings: 'id', media: 'id', messages: 'id' };
const clone = o => JSON.parse(JSON.stringify(o));
const now = () => new Date().toISOString();
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2));

function sampleMessages() {
  const t = Date.now();
  return [
    { id: uuid(), name: 'Örnek Müşteri', email: 'ornek@example.com', company: 'Örnek A.Ş.', project_type: 'Mobil uygulama', budget: '', start_when: '',
      message: 'Demo modunda örnek bir mesaj. Gerçek mesajlar Supabase bağlandığında iletişim formundan gelir.', language: 'tr', status: 'new',
      created_at: new Date(t - 36e5).toISOString(), updated_at: new Date(t - 36e5).toISOString() },
    { id: uuid(), name: 'Sample Client', email: 'client@example.com', company: '', project_type: 'Web panel', budget: '', start_when: '',
      message: 'A sample English message so you can try read / archive / delete in demo mode.', language: 'en', status: 'read',
      created_at: new Date(t - 864e5).toISOString(), updated_at: new Date(t - 864e5).toISOString() }
  ];
}

/** Same shape as the site_payload() SQL function, written where app.js looks for demo content. */
function composePayload(db) {
  const sec = Object.fromEntries(db.content_sections.map(r => [r.key, r.data]));
  const s = db.settings[0] || {};
  const texts = {};
  if (sec.hero?.lede) texts.hero_lede = sec.hero.lede;
  if (sec.about?.statement) texts.statement = sec.about.statement;
  if (sec.about?.more) texts.about_more = sec.about.more;
  if (sec.contact?.lede) texts.c_lede = sec.contact.lede;
  return {
    settings: { status: s.status, availableFrom: s.available_from, email: s.email, linkedin: s.linkedin, socials: s.socials, formAccessKey: s.form_access_key },
    texts,
    services: sec.services?.items ?? null,
    seo: sec.seo ?? null,
    testimonials: sec.testimonials?.items ?? null,
    projects: db.projects.filter(p => p.visible).sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id))
      .map(p => ({ id: p.id, visible: p.visible, featured: p.featured, badge: p.badge || '', theme: p.theme, mock: p.mock, name: p.name, cat: p.cat,
        desc: p.description, tags: p.tags, facts: p.facts, tech: p.tech, media: p.media }))
  };
}

/** @returns {Promise<import('./contract.js').Adapter>} */
export async function createDemoAdapter() {
  let db = null;
  try { db = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { db = null; }
  if (!db) {
    const res = await fetch(SEED_URL, { cache: 'no-store' });
    if (!res.ok) throw new AppError('Demo verisi yüklenemedi.');
    db = await res.json();
    db.settings = [db.settings];
    db.messages = sampleMessages();
  }

  const persist = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(composePayload(db)));
    } catch (e) { throw new AppError('Tarayıcı depolama alanı doldu. Demo modunda daha küçük görseller kullan.', e); }
  };
  persist();

  const table = name => { if (!db[name]) throw new AppError(`Bilinmeyen tablo: ${name}`); return db[name]; };
  const matches = eq => r => Object.entries(eq || {}).every(([k, v]) => r[k] === v);
  const find = (name, key, value) => table(name).find(r => r[key] === value) || null;

  return {
    kind: 'demo',

    auth: {
      async getUser() { return { email: 'demo@localhost' }; },
      async signIn() { return { email: 'demo@localhost' }; },
      async signOut() {},
      async isAdmin() { return true; }
    },

    async list(name, { eq, order = [] } = {}) {
      const rows = table(name).filter(matches(eq)).map(clone);
      return rows.sort((a, b) => {
        for (const [col, asc] of order) {
          const x = a[col], y = b[col];
          if (x === y) continue;
          return (x > y ? 1 : -1) * (asc ? 1 : -1);
        }
        return 0;
      });
    },

    async count(name, eq) { return table(name).filter(matches(eq)).length; },

    async get(name, key, value) { const r = find(name, key, value); return r && clone(r); },

    async insert(name, row) {
      const key = KEYS[name];
      const rec = { created_at: now(), updated_at: now(), ...clone(row) };
      if (key === 'id' && rec.id == null) rec.id = uuid();
      if (find(name, key, rec[key])) throw Object.assign(new Error('duplicate'), { code: '23505' });
      table(name).push(rec); persist();
      return clone(rec);
    },

    async update(name, key, value, patch) {
      const r = find(name, key, value);
      if (!r) throw new AppError('Kayıt bulunamadı.');
      Object.assign(r, clone(patch), { updated_at: now() }); persist();
      return clone(r);
    },

    async upsert(name, row, key) {
      return find(name, key, row[key]) ? this.update(name, key, row[key], row) : this.insert(name, row);
    },

    async remove(name, key, value) {
      const rows = table(name), i = rows.findIndex(r => r[key] === value);
      if (i < 0) throw new AppError('Kayıt bulunamadı.');
      rows.splice(i, 1); persist();
    },

    async rpc(name, args = {}) {
      if (name === 'reorder_projects') {
        args.ids.forEach((id, i) => { const p = find('projects', 'id', id); if (p) p.sort_order = i + 1; });
        persist(); return null;
      }
      if (name === 'is_admin') return true;
      throw new AppError(`Demo modunda desteklenmeyen işlem: ${name}`);
    },

    storage: {
      async upload(_path, blob) { return blobToDataUrl(blob); },
      async remove() {}
    },

    /** Demo only: forget every change and start from the seed again. */
    reset() {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(PREVIEW_KEY);
    }
  };
}
