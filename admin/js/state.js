// Tiny app-wide store. Pages keep their own local state; only cross-cutting facts live here.

export const state = {
  mode: 'demo',        // 'supabase' | 'demo'
  user: null,          // { email }
  settings: null,      // settingsService domain object
  newMessages: 0,      // sidebar badge
  dirty: false,        // unsaved form changes on the current page
  route: null          // { name, nav, title, params }
};

const listeners = new Set();

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
