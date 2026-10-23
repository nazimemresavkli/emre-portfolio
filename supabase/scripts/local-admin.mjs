// Creates (or resets) an admin account on the LOCAL Supabase stack started with `supabase start`.
//
//   node supabase/scripts/local-admin.mjs [email]     (default: admin@portfolio.test)
//
// The service_role key is read from `supabase status` into memory for this run only; it is never
// written to disk. The generated password and the local URL / anon key go to .env.local (git-ignored).
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const email = process.argv[2] || 'admin@portfolio.test';

const status = Object.fromEntries(
  execFileSync('supabase', ['status', '-o', 'env'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n').map(l => l.match(/^([A-Z_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]])
);
const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = status;
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(API_URL || '')) {
  console.error('Yerel Supabase bulunamadı. Önce `supabase start` çalıştır. (Bu betik yalnızca yerel ortamda çalışır.)');
  process.exit(1);
}

const admin = (p, init = {}) => fetch(API_URL + p, { ...init, headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
const password = randomBytes(15).toString('base64url');

let res = await admin('/auth/v1/admin/users', { method: 'POST', body: JSON.stringify({ email, password, email_confirm: true }) });
let user = await res.json();
if (!res.ok) {
  // Already exists → find it and reset the password.
  const list = await (await admin('/auth/v1/admin/users?per_page=1000')).json();
  user = (list.users || []).find(u => u.email === email);
  if (!user) { console.error('Kullanıcı oluşturulamadı:', user?.msg || res.status); process.exit(1); }
  res = await admin(`/auth/v1/admin/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ password }) });
  if (!res.ok) { console.error('Şifre yenilenemedi:', res.status); process.exit(1); }
}
res = await admin('/rest/v1/admins', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify({ user_id: user.id }) });
if (!res.ok && res.status !== 409) { console.error('Yönetici yetkisi verilemedi:', res.status, await res.text()); process.exit(1); }

// Update .env.local (keep unrelated lines).
const envPath = path.join(ROOT, '.env.local');
const env = new Map((fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '').split('\n').filter(Boolean).map(l => [l.split('=')[0], l]));
const set = (k, v) => env.set(k, `${k}="${v}"`);
set('LOCAL_API_URL', API_URL); set('LOCAL_ANON_KEY', ANON_KEY);
set('LOCAL_TEST_ADMIN_EMAIL', email); set('LOCAL_TEST_ADMIN_PASSWORD', password);
env.delete('LOCAL_SERVICE_ROLE_KEY');
fs.writeFileSync(envPath, [...env.values()].join('\n') + '\n');

console.log(`Yerel yönetici hazır: ${email}`);
console.log('Şifre .env.local dosyasında (LOCAL_TEST_ADMIN_PASSWORD). Göstermek için: grep LOCAL_TEST_ADMIN_PASSWORD .env.local');
