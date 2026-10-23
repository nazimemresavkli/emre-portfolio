import { isConfigured } from '../lib/config.js';
import { guard } from '../lib/errors.js';
import { createSupabaseAdapter } from './adapters/supabaseAdapter.js';
import { createDemoAdapter } from './adapters/demoAdapter.js';
import { createProjectsService } from './projectsService.js';
import { createContentService } from './contentService.js';
import { createMediaService } from './mediaService.js';
import { createMessagesService } from './messagesService.js';
import { createSettingsService } from './settingsService.js';

/** Picks the adapter (Supabase when config.js is filled in, demo otherwise) and wires every service to it. */
export async function createServices() {
  const adapter = isConfigured() ? createSupabaseAdapter() : await createDemoAdapter();
  return {
    mode: adapter.kind,
    auth: {
      getUser: () => guard(adapter.auth.getUser()),
      signIn: (email, password) => guard(adapter.auth.signIn(email, password)),
      signOut: () => guard(adapter.auth.signOut()),
      isAdmin: () => guard(adapter.auth.isAdmin())
    },
    projects: createProjectsService(adapter),
    content: createContentService(adapter),
    media: createMediaService(adapter),
    messages: createMessagesService(adapter),
    settings: createSettingsService(adapter),
    resetDemo: adapter.kind === 'demo' ? () => adapter.reset() : null
  };
}
