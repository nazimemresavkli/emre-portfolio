import { h, icon } from '../lib/dom.js';

/**
 * Sortable table with optional drag-and-drop row ordering (mouse + keyboard).
 *
 * createDataTable({
 *   caption, rowKey: r => id,
 *   columns: [{ key, label, sortable, sortValue: r => v, render: r => Node|string, className }],
 *   empty: () => Node,
 *   reorder: { enabled: () => bool, onReorder: async ids => {} }   // optional
 * }) → { el, setRows(rows), sort }
 */
export function createDataTable({ caption, rowKey, columns, empty, reorder }) {
  let rows = [];
  let sort = { key: null, dir: 1 };
  const live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
  const table = h('table', { class: 'table' });
  const wrap = h('div', { class: 'table-wrap' }, table, live);
  const body = h('div', {}, wrap);

  const canDrag = () => !!reorder && reorder.enabled() && !sort.key;

  function sorted() {
    if (!sort.key) return rows;
    const col = columns.find(c => c.key === sort.key);
    const val = col.sortValue || (r => r[col.key]);
    return [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      return (typeof x === 'string' ? x.localeCompare(y, 'tr') : (x > y) - (x < y)) * sort.dir;
    });
  }

  function header() {
    return h('thead', {}, h('tr', {},
      reorder ? h('th', { scope: 'col', style: { width: '44px' } }, h('span', { class: 'sr-only', text: 'Sırala' })) : null,
      columns.map(c => {
        const th = h('th', { scope: 'col', class: c.className || '' });
        if (c.sortable) {
          th.setAttribute('aria-sort', sort.key === c.key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none');
          th.append(h('button', { type: 'button', text: c.label, onclick: () => {
            // asc → desc → back to manual order
            if (sort.key !== c.key) sort = { key: c.key, dir: 1 };
            else if (sort.dir === 1) sort.dir = -1;
            else sort = { key: null, dir: 1 };
            render();
          } }));
        } else th.textContent = c.label;
        return th;
      })));
  }

  function moveRow(id, delta) {
    const ids = rows.map(rowKey);
    const i = ids.indexOf(id), j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return;
    ids.splice(j, 0, ids.splice(i, 1)[0]);
    commit(ids, id).catch(fail);
  }
  const fail = err => body.dispatchEvent(new CustomEvent('reorder-error', { detail: err, bubbles: true }));

  async function commit(ids, movedId) {
    const prev = rows;
    rows = ids.map(id => prev.find(r => rowKey(r) === id));
    render();
    const pos = ids.indexOf(movedId) + 1;
    live.textContent = `Sıra: ${pos} / ${ids.length}`;
    table.querySelector(`[data-handle="${CSS.escape(movedId)}"]`)?.focus();
    try { await reorder.onReorder(ids); } catch (e) { rows = prev; render(); throw e; }
  }

  function render() {
    const list = sorted();
    const drag = canDrag();
    table.replaceChildren(caption ? h('caption', { class: 'sr-only', text: caption }) : '', header());
    const tbody = h('tbody');
    for (const r of list) {
      const id = rowKey(r);
      const tr = h('tr', { dataset: { id } });
      if (reorder) {
        const handle = h('button', {
          type: 'button', class: 'icon-btn drag-handle', disabled: !drag, dataset: { handle: id },
          'aria-label': drag ? 'Taşı: sürükle ya da ok tuşlarıyla yukarı/aşağı' : 'Sıralamak için filtreleri ve sütun sıralamasını kaldır',
          title: drag ? 'Sürükle veya ↑/↓' : 'Sıralama yalnızca tam liste ve “Sıra” görünümünde',
          onkeydown: e => {
            if (!drag) return;
            if (e.key === 'ArrowUp') { e.preventDefault(); moveRow(id, -1); }
            if (e.key === 'ArrowDown') { e.preventDefault(); moveRow(id, 1); }
          }
        }, icon('grip'));
        tr.append(h('td', {}, handle));
        if (drag) bindDrag(tr, handle, id);
      }
      for (const c of columns) {
        const v = c.render ? c.render(r) : r[c.key];
        tr.append(h('td', { class: c.className || '' }, v));
      }
      tbody.append(tr);
    }
    table.append(tbody);
    body.replaceChildren(list.length ? wrap : empty());
  }

  let dragId = null;
  function bindDrag(tr, handle, id) {
    // Only the grip starts a drag, so text in the row stays selectable.
    handle.addEventListener('mousedown', () => { tr.draggable = true; });
    handle.addEventListener('touchstart', () => { tr.draggable = true; }, { passive: true });
    tr.addEventListener('dragstart', e => { dragId = id; tr.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); });
    tr.addEventListener('dragend', () => { tr.draggable = false; tr.classList.remove('dragging'); clearMarks(); dragId = null; });
    tr.addEventListener('dragover', e => {
      if (!dragId || dragId === id) return;
      e.preventDefault();
      const after = e.clientY > tr.getBoundingClientRect().top + tr.offsetHeight / 2;
      clearMarks(); tr.classList.add(after ? 'drop-after' : 'drop-before');
    });
    tr.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragId || dragId === id) return;
      const after = tr.classList.contains('drop-after');
      const ids = rows.map(rowKey).filter(x => x !== dragId);
      ids.splice(ids.indexOf(id) + (after ? 1 : 0), 0, dragId);
      const moved = dragId; clearMarks();
      commit(ids, moved).catch(fail);
    });
  }
  const clearMarks = () => table.querySelectorAll('.drop-before, .drop-after').forEach(x => x.classList.remove('drop-before', 'drop-after'));

  return {
    el: body,
    setRows(next) { rows = next; render(); },
    get sort() { return sort; },
    rerender: render
  };
}
