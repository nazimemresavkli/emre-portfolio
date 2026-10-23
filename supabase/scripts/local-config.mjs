// Points config.js at the LOCAL Supabase stack for testing, and back.
//
//   node supabase/scripts/local-config.mjs on    → config.js uses LOCAL_API_URL / LOCAL_ANON_KEY from .env.local
//   node supabase/scripts/local-config.mjs off   → config.js restored from git (do this before committing!)
//
// Only the anon key is ever written to config.js; it is public by design. The service_role key never is.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONFIG = path.join(ROOT, 'config.js');
const mode = process.argv[2];

if (mode === 'off') {
  execFileSync('git', ['checkout', '--', 'config.js'], { cwd: ROOT, stdio: 'inherit' });
  console.log('config.js git’teki haline döndü.');
} else if (mode === 'on') {
  const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')
    .map(l => l.match(/^([A-Z_]+)="?(.*?)"?$/)).filter(Boolean).map(m => [m[1], m[2]]));
  if (!env.LOCAL_API_URL || !env.LOCAL_ANON_KEY) { console.error('.env.local içinde LOCAL_API_URL / LOCAL_ANON_KEY yok. Önce: node supabase/scripts/local-admin.mjs'); process.exit(1); }
  const src = fs.readFileSync(CONFIG, 'utf8')
    .replace(/supabaseUrl:\s*"[^"]*"/, `supabaseUrl: "${env.LOCAL_API_URL}"`)
    .replace(/supabaseAnonKey:\s*"[^"]*"/, `supabaseAnonKey: "${env.LOCAL_ANON_KEY}"`);
  fs.writeFileSync(CONFIG, src);
  console.log(`config.js → ${env.LOCAL_API_URL} (yerel). Commit etmeden önce: node supabase/scripts/local-config.mjs off`);
} else {
  console.error('Kullanım: node supabase/scripts/local-config.mjs on|off');
  process.exit(1);
}
