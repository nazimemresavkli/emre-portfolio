import { getClient } from '../../lib/supabaseClient.js';
import { AppError } from '../../lib/errors.js';
import { BUCKET } from './contract.js';

/** Throws the PostgREST/Storage error as-is so lib/errors.js can translate its code. */
const unwrap = ({ data, error, count }) => {
  if (error) throw error;
  return count ?? data;
};

/** @returns {import('./contract.js').Adapter} */
export function createSupabaseAdapter() {
  const sb = getClient();

  const query = (table, { eq = {}, order = [] } = {}) => {
    let q = sb.from(table).select('*');
    for (const [k, v] of Object.entries(eq)) q = q.eq(k, v);
    for (const [col, asc] of order) q = q.order(col, { ascending: asc });
    return q;
  };

  return {
    kind: 'supabase',

    auth: {
      async getUser() {
        const { data } = await sb.auth.getSession();
        return data.session ? { email: data.session.user.email } : null;
      },
      async signIn(email, password) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { email: data.user.email };
      },
      async signOut() { await sb.auth.signOut(); },
      async isAdmin() { return unwrap(await sb.rpc('is_admin')) === true; }
    },

    async list(table, opts) { return unwrap(await query(table, opts)); },

    async count(table, eq = {}) {
      let q = sb.from(table).select('*', { count: 'exact', head: true });
      for (const [k, v] of Object.entries(eq)) q = q.eq(k, v);
      return unwrap(await q) || 0;
    },

    async get(table, key, value) { return unwrap(await sb.from(table).select('*').eq(key, value).maybeSingle()); },

    async insert(table, row) { return unwrap(await sb.from(table).insert(row).select().single()); },

    async update(table, key, value, patch) {
      const rows = unwrap(await sb.from(table).update(patch).eq(key, value).select());
      if (!rows.length) throw new AppError('Kayıt bulunamadı veya bu işlem için yetkin yok.');
      return rows[0];
    },

    async upsert(table, row, key) { return unwrap(await sb.from(table).upsert(row, { onConflict: key }).select().single()); },

    async remove(table, key, value) {
      const n = unwrap(await sb.from(table).delete({ count: 'exact' }).eq(key, value));
      if (!n) throw new AppError('Kayıt bulunamadı veya silme yetkin yok.');
    },

    async rpc(name, args) { return unwrap(await sb.rpc(name, args)); },

    storage: {
      async upload(path, blob, contentType) {
        unwrap(await sb.storage.from(BUCKET).upload(path, blob, { contentType, upsert: false, cacheControl: '31536000' }));
        return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      },
      async remove(path) { unwrap(await sb.storage.from(BUCKET).remove([path])); }
    }
  };
}
