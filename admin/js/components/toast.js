import { h, icon } from '../lib/dom.js';

// One stack, two live regions: polite for confirmations, assertive for errors.
let polite, assertive;
function regions() {
  if (!polite) {
    polite = h('div', { role: 'status', 'aria-live': 'polite', style: { display: 'grid', gap: '8px' } });
    assertive = h('div', { role: 'alert', 'aria-live': 'assertive', style: { display: 'grid', gap: '8px' } });
    document.body.append(h('div', { class: 'toasts' }, polite, assertive));
  }
  return { polite, assertive };
}

/** toast('Kaydedildi') or toast('Hata mesajı', 'error') */
export function toast(message, type = 'success') {
  const { polite, assertive } = regions();
  const t = h('div', { class: `toast ${type}` }, icon(type === 'error' ? 'alert' : 'check'), h('span', { text: message }));
  (type === 'error' ? assertive : polite).append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, type === 'error' ? 6500 : 3200);
}
