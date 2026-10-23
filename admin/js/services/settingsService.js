import { guard, AppError } from '../lib/errors.js';
import { email, httpsUrl } from '../lib/validate.js';
import { SOCIALS } from '../lib/config.js';

const toDomain = r => ({
  status: r?.status || 'available',
  availableFrom: r?.available_from || { tr: '', en: '' },
  email: r?.email || '',
  linkedin: r?.linkedin || '',
  socials: r?.socials || {},
  formAccessKey: r?.form_access_key || '',
  adminTheme: r?.admin_theme || 'system',
  defaultProjectTheme: r?.default_project_theme || 'cobalt',
  updatedAt: r?.updated_at || null
});

/** Field errors ({} when valid). */
export function validateSettings(s) {
  const e = {};
  const m = email(s.email); if (m) e.email = m;
  if (!s.email) e.email = 'İletişim e-postası zorunlu.';
  const li = httpsUrl(s.linkedin); if (li) e.linkedin = li;
  for (const [key] of SOCIALS) { const x = httpsUrl(s.socials?.[key]); if (x) e['socials.' + key] = x; }
  if (String(s.formAccessKey || '').length > 100) e.formAccessKey = 'Anahtar çok uzun.';
  return e;
}

export function createSettingsService(adapter) {
  return {
    async get() { return toDomain(await guard(adapter.get('settings', 'id', 1))); },

    async save(s) {
      const errors = validateSettings(s);
      if (Object.keys(errors).length) throw new AppError(Object.values(errors)[0]);
      const socials = Object.fromEntries(SOCIALS.map(([k]) => [k, String(s.socials?.[k] || '').trim()]).filter(([, v]) => v));
      const row = {
        id: 1, status: s.status, available_from: { tr: String(s.availableFrom?.tr || '').trim(), en: String(s.availableFrom?.en || '').trim() },
        email: s.email.trim(), linkedin: String(s.linkedin || '').trim(), socials, form_access_key: String(s.formAccessKey || '').trim(),
        admin_theme: s.adminTheme, default_project_theme: s.defaultProjectTheme
      };
      return toDomain(await guard(adapter.upsert('settings', row, 'id')));
    }
  };
}
