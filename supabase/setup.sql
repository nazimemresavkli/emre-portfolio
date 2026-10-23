-- Portfolyo yönetim paneli kurulumu
-- Supabase > SQL Editor'da bu dosyanın tamamını bir kez çalıştır.

-- 1) Panele girebilecek kişiler
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2) Site içeriği (tek satır: id = 1)
create table if not exists public.site_content (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "content public read" on public.site_content;
create policy "content public read" on public.site_content
  for select using (true);

drop policy if exists "content admin insert" on public.site_content;
create policy "content admin insert" on public.site_content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "content admin update" on public.site_content;
create policy "content admin update" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3) Proje görselleri için herkese açık depolama alanı
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- 4) Kendini yönetici yap
-- Önce Authentication > Users > "Add user" ile kullanıcını oluştur (Auto Confirm açık),
-- sonra aşağıdaki satırı çalıştır:
insert into public.admins (user_id)
select id from auth.users where email = 'nazimemresavkli@gmail.com'
on conflict do nothing;
