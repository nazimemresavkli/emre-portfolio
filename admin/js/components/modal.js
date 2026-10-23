import { h, icon, nextId } from '../lib/dom.js';

/**
 * Native <dialog> modal: focus trapping, Esc to close and inert background come from the browser.
 * openModal({ title, body: Node, actions: Node[], size: 'md'|'lg', onClose }) → { el, close }
 */
export function openModal({ title, body, actions = [], size = 'md', onClose } = {}) {
  const titleId = nextId('dlg');
  const dialog = h('dialog', { class: `modal ${size}`, 'aria-labelledby': titleId },
    h('div', { class: 'modal-head' },
      h('h2', { id: titleId, text: title }),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Kapat', onclick: () => close() }, icon('close'))),
    h('div', { class: 'modal-body' }, body),
    actions.length ? h('div', { class: 'modal-foot' }, actions) : null);

  let closed = false;
  function close(result) {
    if (closed) return;
    closed = true;
    if (dialog.open) dialog.close();
    dialog.remove();
    onClose?.(result);
  }
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); }); // click on backdrop

  document.body.append(dialog);
  dialog.showModal();
  const first = dialog.querySelector('.modal-body [autofocus], .modal-body input, .modal-body select, .modal-body textarea, .modal-foot .btn-primary, .modal-foot .btn');
  first?.focus();
  return { el: dialog, close };
}
