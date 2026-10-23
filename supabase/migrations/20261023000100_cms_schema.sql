-- CMS schema for the admin panel (admin/).
-- Public: read-only access to what the site shows. Writes: admins only (public.is_admin()).
-- Visitors may only INSERT contact messages; they can never read them back.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- projects
create table if not exists public.projects (
  id          text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  sort_order  int  not null default 0,
  visible     boolean not null default true,     -- yayında / taslak
  featured    boolean not null default true,     -- big case card vs "also built" list
  badge       text check (badge in ('shipped','inuse','concept','')),
  theme       text not null default 'cobalt' check (theme ~ '^[a-z]{1,32}$'),
  mock        text not null default '' check (mock ~ '^[a-z0-9-]{0,32}$'),
  name        jsonb not null default '{"tr":"","en":""}' check (jsonb_typeof(name) = 'object'),
  cat         jsonb not null default '{"tr":"","en":""}' check (jsonb_typeof(cat) = 'object'),
  description jsonb not null default '{"tr":"","en":""}' check (jsonb_typeof(description) = 'object'),
  tags        jsonb not null default '{"tr":[],"en":[]}' check (jsonb_typeof(tags) = 'object'),
  facts       jsonb not null default '[]' check (jsonb_typeof(facts) = 'array'),
  tech        text[] not null default '{}',
  media       jsonb not null default '[]' check (jsonb_typeof(media) = 'array'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists projects_sort_idx on public.projects (sort_order, id);
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select using (visible);
drop policy if exists "projects admin read" on public.projects;
create policy "projects admin read" on public.projects
  for select to authenticated using (public.is_admin());
drop policy if exists "projects admin insert" on public.projects;
create policy "projects admin insert" on public.projects
  for insert to authenticated with check (public.is_admin());
drop policy if exists "projects admin update" on public.projects;
create policy "projects admin update" on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "projects admin delete" on public.projects;
create policy "projects admin delete" on public.projects
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- content_sections
-- One row per editable section: hero, about, services, contact, seo, testimonials.
create table if not exists public.content_sections (
  key        text primary key check (key in ('hero','about','services','contact','seo','testimonials')),
  data       jsonb not null default '{}' check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);
drop trigger if exists content_sections_updated_at on public.content_sections;
create trigger content_sections_updated_at before update on public.content_sections
  for each row execute function public.set_updated_at();

alter table public.content_sections enable row level security;
drop policy if exists "sections public read" on public.content_sections;
create policy "sections public read" on public.content_sections
  for select using (true);
drop policy if exists "sections admin insert" on public.content_sections;
create policy "sections admin insert" on public.content_sections
  for insert to authenticated with check (public.is_admin());
drop policy if exists "sections admin update" on public.content_sections;
create policy "sections admin update" on public.content_sections
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- settings (single row)
create table if not exists public.settings (
  id                    int primary key default 1 check (id = 1),
  status                text not null default 'available' check (status in ('available','limited','busy')),
  available_from        jsonb not null default '{"tr":"","en":""}' check (jsonb_typeof(available_from) = 'object'),
  email                 text not null default '' check (email = '' or email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  linkedin              text not null default '' check (linkedin = '' or linkedin ~ '^https://'),
  socials               jsonb not null default '{}' check (jsonb_typeof(socials) = 'object'),
  form_access_key       text not null default '' check (length(form_access_key) <= 100),
  admin_theme           text not null default 'system' check (admin_theme in ('system','light','dark')),
  default_project_theme text not null default 'cobalt' check (default_project_theme ~ '^[a-z]{1,32}$'),
  updated_at            timestamptz not null default now()
);
drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

alter table public.settings enable row level security;
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings
  for select using (true);
drop policy if exists "settings admin insert" on public.settings;
create policy "settings admin insert" on public.settings
  for insert to authenticated with check (public.is_admin());
drop policy if exists "settings admin update" on public.settings;
create policy "settings admin update" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- media library
-- kind 'storage' = uploaded to the media bucket (deletable); 'builtin' = file shipped in the repo's media/ folder.
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'storage' check (kind in ('storage','builtin')),
  path        text not null unique,
  url         text not null,
  mime        text not null default '',
  size_bytes  int  not null default 0,
  width       int  not null default 0,
  height      int  not null default 0,
  alt         text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.media enable row level security;
drop policy if exists "media rows admin read" on public.media;
create policy "media rows admin read" on public.media
  for select to authenticated using (public.is_admin());
drop policy if exists "media rows admin insert" on public.media;
create policy "media rows admin insert" on public.media
  for insert to authenticated with check (public.is_admin() and kind = 'storage');
drop policy if exists "media rows admin update" on public.media;
create policy "media rows admin update" on public.media
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "media rows admin delete" on public.media;
create policy "media rows admin delete" on public.media
  for delete to authenticated using (public.is_admin() and kind = 'storage');

-- ---------------------------------------------------------------- messages (contact form inbox)
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(btrim(name)) between 1 and 200),
  email        text not null check (length(email) <= 320 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  company      text not null default '' check (length(company) <= 200),
  project_type text not null default '' check (length(project_type) <= 300),
  budget       text not null default '' check (length(budget) <= 100),
  start_when   text not null default '' check (length(start_when) <= 100),
  message      text not null check (length(btrim(message)) between 10 and 5000),
  language     text not null default 'tr' check (language in ('tr','en')),
  status       text not null default 'new' check (status in ('new','read','archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists messages_email_idx on public.messages (email, created_at desc);
drop trigger if exists messages_updated_at on public.messages;
create trigger messages_updated_at before update on public.messages
  for each row execute function public.set_updated_at();

-- Visitors cannot choose status/timestamps, and a simple throttle keeps form spam in check.
create or replace function public.messages_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if (select count(*) from public.messages where email = new.email and created_at > now() - interval '10 minutes') >= 3
     or (select count(*) from public.messages where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  new.status := 'new';
  new.created_at := now();
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists messages_guard on public.messages;
create trigger messages_guard before insert on public.messages
  for each row execute function public.messages_guard();

alter table public.messages enable row level security;
drop policy if exists "messages public insert" on public.messages;
create policy "messages public insert" on public.messages
  for insert to anon, authenticated with check (status = 'new');
drop policy if exists "messages admin read" on public.messages;
create policy "messages admin read" on public.messages
  for select to authenticated using (public.is_admin());
drop policy if exists "messages admin update" on public.messages;
create policy "messages admin update" on public.messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "messages admin delete" on public.messages;
create policy "messages admin delete" on public.messages
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- public payload
-- Assembles the same shape as window.DEFAULT_CONTENT so app.js can merge it unchanged.
-- SECURITY INVOKER: RLS still applies, so anonymous callers only get visible projects.
create or replace function public.site_payload()
returns jsonb language sql stable security invoker set search_path = public as $$
  with s as (select key, data from public.content_sections)
  select jsonb_build_object(
    'settings', (select jsonb_build_object(
        'status', status, 'availableFrom', available_from, 'email', email,
        'linkedin', linkedin, 'socials', socials, 'formAccessKey', form_access_key)
      from public.settings where id = 1),
    'texts', jsonb_strip_nulls(jsonb_build_object(
        'hero_lede',  (select data->'lede' from s where key = 'hero'),
        'statement',  (select data->'statement' from s where key = 'about'),
        'about_more', (select data->'more' from s where key = 'about'),
        'c_lede',     (select data->'lede' from s where key = 'contact'))),
    'services',     (select data->'items' from s where key = 'services'),
    'seo',          (select data from s where key = 'seo'),
    'testimonials', (select data->'items' from s where key = 'testimonials'),
    'projects', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', id, 'visible', visible, 'featured', featured, 'badge', coalesce(badge, ''),
        'theme', theme, 'mock', mock, 'name', name, 'cat', cat, 'desc', description,
        'tags', tags, 'facts', facts, 'tech', to_jsonb(tech), 'media', media)
        order by sort_order, id), '[]'::jsonb)
      from public.projects where visible)
  );
$$;
revoke all on function public.site_payload() from public;
grant execute on function public.site_payload() to anon, authenticated;

-- Atomic drag-and-drop reordering: pass project ids in their new order.
create or replace function public.reorder_projects(ids text[])
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.projects p set sort_order = o.ord
    from unnest(ids) with ordinality as o(id, ord)
   where p.id = o.id;
end $$;
revoke all on function public.reorder_projects(text[]) from public, anon;
grant execute on function public.reorder_projects(text[]) to authenticated;
