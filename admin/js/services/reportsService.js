import { tr } from '../lib/format.js';
import { CATALOG, BADGES } from '../lib/config.js';
import { SECTIONS } from './contentService.js';

// Reports are computed from content and inbox data only. Visitor/traffic analytics needs a provider
// (Vercel Analytics, Plausible…) and is intentionally out of scope here.

const DAY = 864e5;
const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const shortDate = d => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
const count = (list, fn) => list.reduce((n, x) => n + (fn(x) ? 1 : 0), 0);
const sortDesc = rows => rows.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'tr'));

/** Calendar weeks (Mon–Sun) covering the last `days` days, oldest first. Partial weeks are flagged. */
export function weeklyBins(dates, now = new Date(), days = 30) {
  const end = startOfDay(now);
  const start = new Date(end.getTime() - (days - 1) * DAY);
  const bins = [];
  for (let d = new Date(start); d <= end;) {
    const monday = new Date(d.getTime() - ((d.getDay() + 6) % 7) * DAY);
    const binStart = monday < start ? start : monday;
    const sunday = new Date(monday.getTime() + 6 * DAY);
    const binEnd = sunday > end ? end : sunday;
    const len = Math.round((binEnd - binStart) / DAY) + 1;
    bins.push({ start: binStart, end: binEnd, partial: len < 7, days: len, value: 0 });
    d = new Date(binEnd.getTime() + DAY);
  }
  for (const iso of dates) {
    const t = startOfDay(new Date(iso));
    const b = bins.find(x => t >= x.start && t <= x.end);
    if (b) b.value++;
  }
  return bins.map(b => ({
    ...b,
    shortLabel: shortDate(b.start),
    label: b.start.getMonth() === b.end.getMonth() && b.days > 1
      ? `${b.start.getDate()}–${shortDate(b.end)}`
      : b.days > 1 ? `${shortDate(b.start)} – ${shortDate(b.end)}` : shortDate(b.start)
  }));
}

/** Pure aggregation; every input is a plain list so it is easy to test. */
export function buildReport({ projects, media, messages, sections, now = new Date() }) {
  const live = count(projects, p => p.visible);

  const byBadge = BADGES.map(([key, label]) => {
    const ps = projects.filter(p => (p.badge || '') === key);
    return { label, value: ps.length, detail: `${count(ps, p => p.visible)} yayında · ${count(ps, p => !p.visible)} taslak` };
  }).filter(r => r.value || r.label !== 'Rozet yok');

  const techById = Object.fromEntries((CATALOG.tech || []).map(t => [t.id, t]));
  const byLayer = sortDesc((CATALOG.layers || []).filter(l => !l.process).map(l => {
    const ps = projects.filter(p => (p.tech || []).some(id => techById[id]?.layer === l.id));
    return { label: tr(l.name), value: ps.length, detail: ps.map(p => tr(p.name)).join(', ') || '—' };
  }));

  const techCount = {};
  for (const p of projects) for (const id of p.tech || []) techCount[id] = (techCount[id] || 0) + 1;
  const topTech = sortDesc(Object.entries(techCount).map(([id, value]) => {
    const t = techById[id];
    return { label: t ? (typeof t.name === 'string' ? t.name : tr(t.name)) : id, value, detail: `${value} projede` };
  })).slice(0, 8);

  const placement = [
    { label: 'Büyük kart', value: count(projects, p => p.featured), detail: 'Seçili işler bölümü' },
    { label: 'Liste', value: count(projects, p => !p.featured), detail: '“Ayrıca geliştirdiklerim”' }
  ];

  // media
  const used = new Set(projects.flatMap(p => (p.media || []).map(m => m.url)));
  const uploads = media.filter(m => m.kind === 'storage');
  const mediaSummary = {
    total: media.length,
    uploads: uploads.length,
    builtin: media.length - uploads.length,
    totalBytes: media.reduce((n, m) => n + (m.size_bytes || 0), 0),
    uploadBytes: uploads.reduce((n, m) => n + (m.size_bytes || 0), 0),
    unusedUploads: uploads.filter(m => !used.has(m.url)).length,
    largest: [...media].sort((a, b) => (b.size_bytes || 0) - (a.size_bytes || 0)).slice(0, 5)
      .map(m => ({ name: m.alt || m.path.split('/').pop(), bytes: m.size_bytes || 0, kind: m.kind, used: used.has(m.url) }))
  };

  // messages
  const since = startOfDay(now).getTime() - 29 * DAY;
  const recent = messages.filter(m => new Date(m.created_at).getTime() >= since);
  const typeCount = {};
  for (const m of messages) for (const t of String(m.project_type || '').split(',').map(s => s.trim()).filter(Boolean)) typeCount[t] = (typeCount[t] || 0) + 1;
  const messageSummary = {
    total: messages.length,
    last30: recent.length,
    weekly: weeklyBins(messages.map(m => m.created_at), now, 30),
    byStatus: [
      { label: 'Yeni', value: count(messages, m => m.status === 'new') },
      { label: 'Okundu', value: count(messages, m => m.status === 'read') },
      { label: 'Arşiv', value: count(messages, m => m.status === 'archived') }
    ],
    byLang: { tr: count(messages, m => m.language !== 'en'), en: count(messages, m => m.language === 'en') },
    byType: sortDesc(Object.entries(typeCount).map(([label, value]) => ({ label, value }))).slice(0, 6)
  };

  const freshness = SECTIONS.map(s => ({ label: s.label, key: s.key, updatedAt: sections[s.key]?.updatedAt || null }));

  return {
    projects: { total: projects.length, live, draft: projects.length - live, byBadge, byLayer, topTech, placement },
    media: mediaSummary,
    messages: messageSummary,
    freshness
  };
}

export function createReportsService({ projects, media, messages, content }) {
  return {
    async load(now = new Date()) {
      const [p, m, msg, sec] = await Promise.all([projects.list(), media.list(), messages.list('all'), content.getAll()]);
      return buildReport({ projects: p, media: m, messages: msg, sections: sec, now });
    }
  };
}
