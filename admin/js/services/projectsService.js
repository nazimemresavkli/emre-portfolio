import { guard, AppError } from '../lib/errors.js';
import { slug as slugRule } from '../lib/validate.js';

// Projects as the public site sees them (content.js shape: desc, not description).

const emptyText = () => ({ tr: '', en: '' });

export function blankProject(theme = 'cobalt') {
  return {
    id: '', visible: false, featured: true, badge: 'concept', theme, mock: '',
    name: emptyText(), cat: emptyText(), desc: emptyText(), tags: { tr: [], en: [] },
    facts: [], tech: [], media: [], sortOrder: 0
  };
}

const toDomain = r => ({
  id: r.id, sortOrder: r.sort_order, visible: r.visible, featured: r.featured, badge: r.badge || '', theme: r.theme, mock: r.mock || '',
  name: r.name || emptyText(), cat: r.cat || emptyText(), desc: r.description || emptyText(), tags: r.tags || { tr: [], en: [] },
  facts: r.facts || [], tech: r.tech || [], media: r.media || [], updatedAt: r.updated_at, createdAt: r.created_at
});

const clean = s => String(s || '').trim();
const cleanText = o => ({ tr: clean(o?.tr), en: clean(o?.en) });

/** A media label is stored as a plain string when both languages match (like the original content.js). */
function cleanLabel(l) {
  const v = typeof l === 'string' ? { tr: l, en: l } : cleanText(l);
  if (!v.tr && !v.en) return undefined;
  return !v.en || v.en === v.tr ? v.tr || v.en : v;
}

function cleanMedia(list) {
  const items = (list || []).filter(m => clean(m.url)).map(m => {
    const item = { url: clean(m.url), frame: ['scene', 'browser', 'phone'].includes(m.frame) ? m.frame : 'phone' };
    const label = cleanLabel(m.label);
    if (label) item.label = label;
    if (m.active && item.frame === 'scene') item.active = true;
    return item;
  });
  // At most one default view among scene images.
  let seen = false;
  for (const m of items) { if (m.active) { if (seen) delete m.active; seen = true; } }
  return items;
}

const toRow = p => ({
  id: p.id, visible: !!p.visible, featured: !!p.featured, badge: p.badge || '', theme: p.theme || 'cobalt', mock: p.mock || '',
  name: cleanText(p.name), cat: cleanText(p.cat), description: cleanText(p.desc),
  tags: { tr: (p.tags?.tr || []).map(clean).filter(Boolean), en: (p.tags?.en || []).map(clean).filter(Boolean) },
  facts: (p.facts || []).map(f => ({ l: cleanText(f.l), v: cleanText(f.v) })).filter(f => f.l.tr || f.v.tr || f.l.en || f.v.en),
  tech: [...new Set(p.tech || [])],
  media: cleanMedia(p.media)
});

/** Field errors for the editor ({} when valid). */
export function validateProject(p, { isNew = false } = {}) {
  const e = {};
  if (isNew) { const m = slugRule(p.id); if (m) e.id = m; }
  if (!clean(p.name?.tr)) e['name.tr'] = 'Proje adı (TR) zorunlu.';
  if (clean(p.name?.tr).length > 80) e['name.tr'] = 'En fazla 80 karakter.';
  if (clean(p.desc?.tr).length > 600) e['desc.tr'] = 'En fazla 600 karakter.';
  if (clean(p.desc?.en).length > 600) e['desc.en'] = 'En fazla 600 karakter.';
  if (p.visible && !clean(p.desc?.tr)) e['desc.tr'] = 'Yayındaki bir projenin açıklaması olmalı.';
  return e;
}

export function createProjectsService(adapter) {
  return {
    async list() {
      const rows = await guard(adapter.list('projects', { order: [['sort_order', true], ['id', true]] }));
      return rows.map(toDomain);
    },

    async get(id) {
      const r = await guard(adapter.get('projects', 'id', id));
      return r ? toDomain(r) : null;
    },

    async create(p) {
      const errors = validateProject(p, { isNew: true });
      if (Object.keys(errors).length) throw new AppError(Object.values(errors)[0]);
      const all = await this.list();
      if (all.some(x => x.id === p.id)) throw new AppError('Bu kısa ad zaten kullanılıyor. Farklı bir kısa ad seç.');
      const sort_order = all.reduce((m, x) => Math.max(m, x.sortOrder || 0), 0) + 10;
      return toDomain(await guard(adapter.insert('projects', { ...toRow(p), sort_order })));
    },

    async update(id, p) {
      const errors = validateProject(p);
      if (Object.keys(errors).length) throw new AppError(Object.values(errors)[0]);
      const { id: _ignored, ...row } = toRow(p);
      return toDomain(await guard(adapter.update('projects', 'id', id, row)));
    },

    async setVisible(id, visible) {
      if (visible) {
        const p = await this.get(id);
        if (p && !clean(p.desc?.tr)) throw new AppError('Yayına almadan önce projeye bir açıklama (TR) ekle.');
      }
      return toDomain(await guard(adapter.update('projects', 'id', id, { visible })));
    },

    async remove(id) { await guard(adapter.remove('projects', 'id', id)); },

    /** Persists a new order (array of ids, first = top of the site). */
    async reorder(ids) { await guard(adapter.rpc('reorder_projects', { ids })); }
  };
}
