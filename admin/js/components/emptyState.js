import { h, icon } from '../lib/dom.js';

export function emptyState({ iconName = 'image', title, text = '', action = null }) {
  return h('div', { class: 'state' },
    h('div', { class: 'state-icon' }, icon(iconName, 22)),
    h('h3', { text: title }),
    text ? h('p', { text }) : null,
    action);
}

export function loadingState(text = 'Yükleniyor…') {
  return h('div', { class: 'state', role: 'status', 'aria-live': 'polite' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), h('p', { text }));
}

export function errorState(message, onRetry) {
  return h('div', { class: 'state error', role: 'alert' },
    h('div', { class: 'state-icon' }, icon('alert', 22)),
    h('h3', { text: 'Bir şeyler ters gitti' }),
    h('p', { text: message }),
    onRetry ? h('button', { class: 'btn', type: 'button', onclick: onRetry }, icon('refresh', 16), 'Tekrar dene') : null);
}

/** Puts a button into a busy state while `fn` runs; returns fn's result. */
export async function withBusy(button, fn, busyText) {
  const label = [...button.childNodes];
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.replaceChildren(h('span', { class: 'spinner', 'aria-hidden': 'true' }), busyText || button.textContent);
  try { return await fn(); } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.replaceChildren(...label);
  }
}
