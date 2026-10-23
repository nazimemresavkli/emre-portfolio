import { guard, AppError } from '../lib/errors.js';

// Editable site sections (content_sections table). Shapes match what site_payload() reads:
//   hero { lede }  about { statement, more }  contact { lede }
//   services { items: [{ title, desc, tags: [{tr,en}|string] }] }
//   seo { title, description }  testimonials { items: [{ quote, name, role, company }] }

export const SECTIONS = [
  { key: 'hero', label: 'Giriş (hero)' },
  { key: 'about', label: 'Hakkımda' },
  { key: 'services', label: 'Hizmetler' },
  { key: 'contact', label: 'İletişim' },
  { key: 'seo', label: 'SEO' },
  { key: 'testimonials', label: 'Referanslar' }
];

const t = () => ({ tr: '', en: '' });
const DEFAULTS = {
  hero: () => ({ lede: t() }),
  about: () => ({ statement: t(), more: t() }),
  services: () => ({ items: [] }),
  contact: () => ({ lede: t() }),
  seo: () => ({ title: t(), description: t() }),
  testimonials: () => ({ items: [] })
};

export const SEO_LIMITS = { title: 60, description: 160 };

const clean = s => String(s || '').trim();
const ct = o => ({ tr: clean(o?.tr), en: clean(o?.en) });
const tag = x => (typeof x === 'string' ? clean(x) : ct(x));

/** Normalises and validates a section; returns { data, error }. */
export function normalizeSection(key, d) {
  switch (key) {
    case 'hero':
    case 'contact': {
      const data = { lede: ct(d.lede) };
      return { data, error: data.lede.tr ? '' : 'Türkçe metin boş bırakılamaz.' };
    }
    case 'about': {
      const data = { statement: ct(d.statement), more: ct(d.more) };
      return { data, error: data.statement.tr ? '' : 'Tanıtım paragrafı (TR) boş bırakılamaz.' };
    }
    case 'services': {
      const items = (d.items || []).map(s => ({ title: ct(s.title), desc: ct(s.desc), tags: (s.tags || []).map(tag).filter(x => (typeof x === 'string' ? x : x.tr || x.en)) }));
      const bad = items.findIndex(s => !s.title.tr);
      return { data: { items }, error: bad >= 0 ? `${bad + 1}. hizmetin başlığı (TR) boş.` : items.length ? '' : 'En az bir hizmet olmalı.' };
    }
    case 'seo': {
      const data = { title: ct(d.title), description: ct(d.description) };
      let error = !data.title.tr ? 'SEO başlığı (TR) zorunlu.' : '';
      for (const l of ['tr', 'en']) {
        if (data.title[l].length > SEO_LIMITS.title + 20) error = `Başlık (${l.toUpperCase()}) çok uzun.`;
        if (data.description[l].length > SEO_LIMITS.description + 60) error = `Açıklama (${l.toUpperCase()}) çok uzun.`;
      }
      return { data, error };
    }
    case 'testimonials': {
      const items = (d.items || []).map(q => ({ quote: ct(q.quote), name: clean(q.name), role: ct(q.role), company: clean(q.company) }))
        .filter(q => q.quote.tr || q.quote.en || q.name);
      const bad = items.findIndex(q => !q.quote.tr || !q.name);
      return { data: { items }, error: bad >= 0 ? `${bad + 1}. referansta alıntı (TR) ve isim zorunlu.` : '' };
    }
    default:
      return { data: d, error: 'Bilinmeyen bölüm.' };
  }
}

export function createContentService(adapter) {
  return {
    /** { key: { data, updatedAt } } for every section (missing rows get empty defaults). */
    async getAll() {
      const rows = await guard(adapter.list('content_sections'));
      const out = {};
      for (const { key } of SECTIONS) {
        const r = rows.find(x => x.key === key);
        out[key] = { data: { ...DEFAULTS[key](), ...(r?.data || {}) }, updatedAt: r?.updated_at || null };
      }
      return out;
    },

    async save(key, data) {
      const { data: clean, error } = normalizeSection(key, data);
      if (error) throw new AppError(error);
      const r = await guard(adapter.upsert('content_sections', { key, data: clean }, 'key'));
      return { data: r.data, updatedAt: r.updated_at };
    }
  };
}
