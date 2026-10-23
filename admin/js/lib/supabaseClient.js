import { SITE_CONFIG } from './config.js';

let client = null;

/** Lazily creates the single Supabase client (anon key only; the service_role key never belongs in the browser). */
export function getClient() {
  if (client) return client;
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Supabase kütüphanesi yüklenemedi (/vendor/supabase.js).');
  }
  client = window.supabase.createClient(SITE_CONFIG.supabaseUrl, SITE_CONFIG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return client;
}
