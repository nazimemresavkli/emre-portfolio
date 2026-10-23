import { guard } from '../lib/errors.js';

export const MESSAGE_FILTERS = [
  ['new', 'Yeni'], ['read', 'Okundu'], ['archived', 'Arşiv'], ['all', 'Tümü']
];

export function createMessagesService(adapter) {
  return {
    async list(status = 'all') {
      const eq = status === 'all' ? {} : { status };
      return guard(adapter.list('messages', { eq, order: [['created_at', false]] }));
    },

    async countNew() { return guard(adapter.count('messages', { status: 'new' })); },

    async setStatus(id, status) { return guard(adapter.update('messages', 'id', id, { status })); },

    async remove(id) { await guard(adapter.remove('messages', 'id', id)); }
  };
}
