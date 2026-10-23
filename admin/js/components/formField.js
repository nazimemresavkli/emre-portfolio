import { h, icon, nextId } from '../lib/dom.js';

// Form building blocks. Every field carries data-field="<path>" so showErrors() can mark it.

/** Label + control + hint + error, with aria wiring. */
export function field({ label, control, hint = '', name = '', counter = null, className = '' }) {
  const id = control.id || (control.id = nextId());
  const errId = nextId('err'), hintId = hint ? nextId('hint') : null;
  control.setAttribute('aria-describedby', [hintId, errId].filter(Boolean).join(' '));
  return h('div', { class: `field ${className}`, dataset: name ? { field: name } : {} },
    h('label', { htmlFor: id }, h('span', { text: label }), counter),
    control,
    hint ? h('div', { class: 'hint', id: hintId, text: hint }) : null,
    h('div', { class: 'field-error', id: errId }));
}

/** Plain text input bound to obj[key]. */
export function textField({ label, obj, key, name = key, hint, type = 'text', placeholder = '', maxLength, onChange, readOnly = false, autocomplete }) {
  const input = h('input', { class: 'input', type, value: obj[key] ?? '', placeholder, readOnly, autocomplete });
  const counter = maxLength ? counterEl(input, maxLength) : null;
  input.addEventListener('input', () => { obj[key] = input.value; onChange?.(input.value); });
  return field({ label, control: input, hint, name, counter });
}

export function textareaField({ label, obj, key, name = key, hint, rows = 4, maxLength, onChange }) {
  const ta = h('textarea', { class: 'textarea', rows });
  ta.value = obj[key] ?? '';
  const counter = maxLength ? counterEl(ta, maxLength) : null;
  ta.addEventListener('input', () => { obj[key] = ta.value; onChange?.(ta.value); });
  return field({ label, control: ta, hint, name, counter });
}

export function selectField({ label, obj, key, name = key, options, hint, onChange }) {
  const sel = h('select', { class: 'select' }, options.map(([v, t]) => h('option', { value: v, text: t, selected: obj[key] === v })));
  sel.addEventListener('change', () => { obj[key] = sel.value; onChange?.(sel.value); });
  return field({ label, control: sel, hint, name });
}

/** Switch bound to obj[key] (boolean). */
export function toggleField({ label, obj, key, hint, onChange }) {
  const input = h('input', { type: 'checkbox', role: 'switch', checked: !!obj[key] });
  input.addEventListener('change', () => { obj[key] = input.checked; onChange?.(input.checked); });
  return h('div', { class: 'field' },
    h('label', { class: 'switch' }, input, h('span', { text: label })),
    hint ? h('div', { class: 'hint', text: hint }) : null);
}

/**
 * TR/EN pair bound to obj[key] = { tr, en }. Plain strings are upgraded to { tr: s, en: s }.
 * Error paths: `${name}.tr` / `${name}.en`.
 */
export function bilingualField({ label, obj, key, name = key, hint, multiline = false, rows = 3, maxLength, requiredTr = false, onChange }) {
  if (typeof obj[key] === 'string' || !obj[key]) obj[key] = { tr: obj[key] || '', en: obj[key] || '' };
  const val = obj[key];
  const make = lang => {
    const control = multiline ? h('textarea', { class: 'textarea', rows }) : h('input', { class: 'input', type: 'text' });
    control.value = val[lang] || '';
    control.setAttribute('aria-label', `${label} (${lang.toUpperCase()})`);
    if (lang === 'tr' && requiredTr) control.setAttribute('aria-required', 'true');
    const counter = maxLength ? counterEl(control, maxLength) : null;
    control.addEventListener('input', () => { val[lang] = control.value; onChange?.(); });
    const errId = nextId('err');
    control.setAttribute('aria-describedby', errId);
    return h('div', { class: 'field', dataset: { field: `${name}.${lang}` } },
      h('div', { class: 'field-label' }, h('span', { class: 'lang', text: lang === 'tr' ? 'TÜRKÇE' : 'ENGLISH' }), counter),
      control,
      h('div', { class: 'field-error', id: errId }));
  };
  return h('div', { class: 'field', dataset: { field: name } },
    h('div', { class: 'field-label' }, h('span', { text: label + (requiredTr ? ' *' : '') })),
    h('div', { class: 'bi' }, make('tr'), make('en')),
    hint ? h('div', { class: 'hint', text: hint }) : null);
}

/** Chip input for string arrays. Enter or comma adds, Backspace on empty removes the last chip. */
export function tagInput({ label, values, onChange, placeholder = 'Ekle ve Enter’a bas', name = '' }) {
  const list = values;
  const input = h('input', { type: 'text', placeholder, 'aria-label': label });
  const box = h('div', { class: 'chips', onclick: e => { if (e.target === box) input.focus(); } });
  const render = () => {
    box.replaceChildren(...list.map((v, i) => h('span', { class: 'chip' }, v,
      h('button', { type: 'button', 'aria-label': `${v} etiketini kaldır`, onclick: () => { list.splice(i, 1); render(); onChange?.(); input.focus(); } }, icon('close', 13)))), input);
  };
  const add = () => {
    const v = input.value.replace(/,/g, '').trim();
    if (v && !list.includes(v)) { list.push(v); onChange?.(); }
    input.value = ''; render(); input.focus();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    else if (e.key === 'Backspace' && !input.value && list.length) { list.pop(); render(); onChange?.(); input.focus(); }
  });
  input.addEventListener('blur', () => { if (input.value.trim()) add(); });
  render();
  return h('div', { class: 'field', dataset: name ? { field: name } : {} }, h('div', { class: 'field-label' }, h('span', { text: label })), box);
}

/** Live character counter shown next to the label. */
function counterEl(control, max) {
  const c = h('span', { class: 'counter', 'aria-hidden': 'true' });
  const upd = () => { const n = control.value.length; c.textContent = `${n}/${max}`; c.classList.toggle('over', n > max); };
  control.addEventListener('input', upd); queueMicrotask(upd);
  return c;
}

/** Writes { path: message } into matching [data-field] elements; focuses the first invalid one. Returns true when clean. */
export function showErrors(root, errors) {
  root.querySelectorAll('[data-field]').forEach(f => {
    const msg = errors[f.dataset.field] || '';
    const own = [...f.querySelectorAll(':scope > .field-error')][0];
    if (own) own.textContent = msg;
    f.classList.toggle('invalid', !!msg);
  });
  const first = Object.keys(errors)[0];
  if (first) {
    const f = root.querySelector(`[data-field="${CSS.escape(first)}"]`);
    f?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    f?.querySelector('input, textarea, select')?.focus({ preventScroll: true });
  }
  return !first;
}

/** Segmented single-choice control: options [[value, label]]. */
export function segmented({ label, options, value, onChange }) {
  const group = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': label });
  const render = () => group.replaceChildren(...options.map(([v, t]) => h('button', {
    type: 'button', role: 'radio', 'aria-checked': String(v === value), 'aria-pressed': String(v === value), text: t,
    onclick: () => { value = v; render(); onChange(v); }
  })));
  render();
  return group;
}

/** Theme colour picker over TECH_CATALOG.themes. */
export function swatchPicker({ label, themes, value, onChange }) {
  const group = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': label });
  const render = () => group.replaceChildren(...Object.entries(themes).map(([id, th]) => h('button', {
    type: 'button', class: 'swatch', role: 'radio', 'aria-checked': String(id === value), title: th.label?.tr || id, 'aria-label': th.label?.tr || id,
    style: { background: th.bg, color: th.fg },
    onclick: () => { value = id; render(); onChange(id); }
  })));
  render();
  return group;
}
