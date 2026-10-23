import { h } from '../lib/dom.js';
import { openModal } from './modal.js';

/**
 * Promise-based confirmation (replaces window.confirm, which blocks the page and can't be styled).
 * await confirmDialog({ title, message, confirmText, danger }) → true | false
 */
export function confirmDialog({ title = 'Emin misin?', message = '', confirmText = 'Sil', cancelText = 'Vazgeç', danger = true } = {}) {
  return new Promise(resolve => {
    let result = false;
    const cancel = h('button', { class: 'btn', type: 'button', text: cancelText, onclick: () => m.close() });
    const ok = h('button', { class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, type: 'button', text: confirmText, onclick: () => { result = true; m.close(); } });
    const m = openModal({
      title,
      body: h('p', { class: 'muted', text: message }),
      actions: [cancel, ok],
      onClose: () => resolve(result)
    });
    // Safer default focus for destructive actions.
    (danger ? cancel : ok).focus();
  });
}
