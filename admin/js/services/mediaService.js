import { guard, AppError } from '../lib/errors.js';
import { checkFile, toWebp } from '../lib/image.js';
import { siteOrigin } from '../lib/config.js';
import { tr } from '../lib/format.js';

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

export function createMediaService(adapter) {
  return {
    /** Newest uploads first, repo (builtin) files last. */
    async list() {
      const rows = await guard(adapter.list('media', { order: [['created_at', false]] }));
      return rows.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'storage' ? -1 : 1));
    },

    /** Resizes to WebP, stores the file, records it in the library. Returns the media row. */
    async upload(file, { maxSide = 2200 } = {}) {
      const problem = checkFile(file);
      if (problem) throw new AppError(problem);
      const { blob, width, height } = await guard(toWebp(file, adapter.kind === 'demo' ? Math.min(maxSide, 1200) : maxSide));
      const d = new Date();
      const path = `library/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${uuid()}.webp`;
      const url = await guard(adapter.storage.upload(path, blob, 'image/webp'));
      const alt = file.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 120);
      try {
        return await guard(adapter.insert('media', { kind: 'storage', path, url, mime: 'image/webp', size_bytes: blob.size, width, height, alt }));
      } catch (e) {
        await adapter.storage.remove(path).catch(() => {}); // don't leave an orphan file behind
        throw e;
      }
    },

    async updateAlt(id, alt) { return guard(adapter.update('media', 'id', id, { alt: String(alt || '').trim().slice(0, 200) })); },

    /** Project names that reference this file (deleting it would break those cards). */
    usage(item, projects) {
      return projects.filter(p => (p.media || []).some(m => m.url === item.url)).map(p => tr(p.name) || p.id);
    },

    async remove(item) {
      if (item.kind === 'builtin') throw new AppError('Site ile gelen dosyalar buradan silinemez.');
      // Row first: an orphan file in storage is harmless, a library row pointing to nothing is not.
      await guard(adapter.remove('media', 'id', item.id));
      await guard(adapter.storage.remove(item.path));
    },

    /** Absolute URL to copy/share (repo files are relative to the site root). */
    absoluteUrl(item) {
      return /^(https?:|data:)/.test(item.url) ? item.url : `${siteOrigin()}/${item.url.replace(/^\//, '')}`;
    }
  };
}
