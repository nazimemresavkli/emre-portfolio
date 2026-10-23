import { h, nextId, append } from '../lib/dom.js';

// Small, dependency-free HTML charts for the reports page.
// One series per chart → one hue (--viz-1), no legend box (the card title names the series).
// Every mark is focusable with the same tooltip as hover, and every chart has a table view.

const fmt = n => n.toLocaleString('tr-TR');

/** Rounds the axis maximum up to a clean value (1, 2, 5 × 10^n). */
function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v)), f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

function tooltipLayer(root) {
  const tip = h('div', { class: 'viz-tip', role: 'tooltip', hidden: true });
  root.append(tip);
  const show = (mark, row, valueText) => {
    tip.replaceChildren(h('b', { text: valueText }), h('span', { text: row.label }), row.detail ? h('small', { text: row.detail }) : null);
    tip.hidden = false;
    const r = mark.getBoundingClientRect(), base = root.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2 - base.left, 70), base.width - 70);
    tip.style.left = `${x}px`;
    tip.style.top = `${r.top - base.top - 8}px`;
  };
  const hide = () => { tip.hidden = true; };
  return { show, hide };
}

function bindMark(mark, row, valueText, tip) {
  mark.addEventListener('pointerenter', () => tip.show(mark, row, valueText));
  mark.addEventListener('pointerleave', tip.hide);
  mark.addEventListener('focus', () => tip.show(mark, row, valueText));
  mark.addEventListener('blur', tip.hide);
}

/** Toggleable table twin of a chart (the accessible, non-hover way to read every value). */
function tableToggle(caption, rows, unit) {
  const id = nextId('tbl');
  const table = h('table', { class: 'table viz-table', id, hidden: true },
    h('caption', { class: 'sr-only', text: caption }),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Kategori' }), h('th', { scope: 'col', text: unit, style: { textAlign: 'right' } }), rows.some(r => r.detail) ? h('th', { scope: 'col', text: 'Ayrıntı' }) : null)),
    h('tbody', {}, rows.map(r => h('tr', {}, h('td', { text: r.label }), h('td', { class: 'num', text: fmt(r.value) }), rows.some(x => x.detail) ? h('td', { class: 'muted', text: r.detail || '' }) : null))));
  const btn = h('button', { class: 'btn btn-ghost btn-sm viz-toggle', type: 'button', 'aria-controls': id, 'aria-expanded': 'false', text: 'Tablo olarak göster',
    onclick: () => { const open = table.hidden; table.hidden = !open; btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Tabloyu gizle' : 'Tablo olarak göster'; } });
  return [btn, table];
}

/**
 * Horizontal bars, value at the tip. rows: [{ label, value, detail? }]
 * Use for nominal categories (badge, layer, technology, status…).
 */
export function barList({ caption, rows, unit = 'Adet', empty = 'Veri yok' }) {
  const root = h('figure', { class: 'viz' });
  const tip = tooltipLayer(root);
  if (!rows.length || rows.every(r => !r.value)) {
    root.append(h('p', { class: 'viz-empty', text: empty }));
    return root;
  }
  const max = Math.max(...rows.map(r => r.value));
  const list = h('div', { class: 'viz-bars', role: 'list', 'aria-label': caption });
  for (const r of rows) {
    const pct = max ? (r.value / max) * 100 : 0;
    const valueText = `${fmt(r.value)} ${unit.toLocaleLowerCase('tr')}`;
    const mark = h('div', { class: 'viz-row', role: 'listitem', tabindex: '0', 'aria-label': `${r.label}: ${valueText}${r.detail ? ` (${r.detail})` : ''}` },
      h('span', { class: 'viz-label', text: r.label, title: r.label }),
      h('span', { class: 'viz-track' }, h('span', { class: 'viz-bar', style: { width: `${Math.max(pct, r.value ? 1.5 : 0)}%` } })),
      h('span', { class: 'viz-value', text: fmt(r.value) }));
    bindMark(mark, r, valueText, tip);
    list.append(mark);
  }
  append(root, [list, ...tableToggle(caption, rows, unit)]);
  return root;
}

/**
 * Vertical columns over time with a clean y-axis. rows: [{ label, value, detail? }] oldest → newest.
 */
export function columnChart({ caption, rows, unit = 'Adet', note = '' }) {
  const root = h('figure', { class: 'viz' });
  const tip = tooltipLayer(root);
  const top = niceMax(Math.max(...rows.map(r => r.value), 0));
  const step = top <= 5 ? 1 : top / 5; // top is 1/2/5×10^n, so the step is always a whole number
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const plot = h('div', { class: 'viz-plot', role: 'list', 'aria-label': caption },
    h('div', { class: 'viz-grid', 'aria-hidden': 'true' }, ticks.slice().reverse().map(t => h('div', { class: 'viz-gridline', style: { bottom: `${(t / top) * 100}%` } }, h('span', { text: fmt(t) })))));
  const cols = h('div', { class: 'viz-cols' });
  for (const r of rows) {
    const valueText = `${fmt(r.value)} ${unit.toLocaleLowerCase('tr')}`;
    const mark = h('div', { class: 'viz-col', role: 'listitem', tabindex: '0', 'aria-label': `${r.label}: ${valueText}${r.detail ? ` (${r.detail})` : ''}` },
      h('span', { class: 'viz-col-area' },
        h('span', { class: 'viz-col-bar', style: { height: `${(r.value / top) * 100}%` } },
          r.value ? h('span', { class: 'viz-cap', text: fmt(r.value) }) : null)),
      h('span', { class: 'viz-x' }, h('span', { class: 'viz-x-long', text: r.label }), h('span', { class: 'viz-x-short', 'aria-hidden': 'true', text: r.shortLabel || r.label })));
    bindMark(mark, r, valueText, tip);
    cols.append(mark);
  }
  plot.append(cols);
  append(root, [plot, note ? h('figcaption', { class: 'viz-note', text: note }) : null, ...tableToggle(caption, rows, unit)]);
  return root;
}
