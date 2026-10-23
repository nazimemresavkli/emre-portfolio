// Form validation rules. Each returns '' when valid, otherwise a Turkish message.
// The database enforces the same constraints (check constraints in the CMS migration).

export const required = (v, label = 'Bu alan') => (String(v ?? '').trim() ? '' : `${label} zorunlu.`);
export const slug = v => (/^[a-z0-9][a-z0-9-]{0,62}$/.test(v || '') ? '' : 'Yalnızca küçük harf, rakam ve tire (en fazla 63 karakter).');
export const email = v => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Geçerli bir e-posta adresi gir.');
export const httpsUrl = v => (!v || /^https:\/\/[^\s]+\.[^\s]+$/.test(v) ? '' : 'Adres https:// ile başlamalı.');
export const maxLen = (n) => v => (String(v || '').length <= n ? '' : `En fazla ${n} karakter.`);

/** Runs `rules` ({ field: [fn, …] }) against `values`; returns { field: message } for failures. */
export function validate(values, rules) {
  const errors = {};
  for (const [field, fns] of Object.entries(rules)) {
    for (const fn of fns) { const m = fn(values[field]); if (m) { errors[field] = m; break; } }
  }
  return errors;
}
