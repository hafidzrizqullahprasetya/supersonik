create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.chants (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  title text not null,
  audio_url text unique not null,
  audio_type text not null default 'audio/mpeg',
  lyrics text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create unique index if not exists chants_audio_url_key on public.chants (audio_url);

alter table public.site_settings enable row level security;
alter table public.chants enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings for select using (true);

drop policy if exists "Admins manage settings" on public.site_settings;
create policy "Admins manage settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published chants" on public.chants;
create policy "Public can read published chants" on public.chants for select using (published = true or public.is_admin());

drop policy if exists "Admins manage chants" on public.chants;
create policy "Admins manage chants" on public.chants for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value) values
  ('hero', '{"eyebrow":"209 posts · 2,449 followers","title":"CIVILION","title_emphasis":"1949","description":"Official Instagram of Civilion 1949, Civil Engineering UGM fanatics. ¡Vinci per noi!","background_url":"hero-bg.webp","location":"Departemen Teknik Sipil dan Lingkungan UGM, Yogyakarta"}'),
  ('release', '{"eyebrow":"Koleksi chant CIVILION","title":"NYALAKAN","title_emphasis":"TRIBUNMU.","cover_label":"CIVILION 1949","cover_title":"CHANT COLLECTION"}'),
  ('branding', '{"logo_url":"logo-civilion.jpg","collaborator_logo_url":"logo-civilion.jpg","source_url":"https://www.instagram.com/civilion1949/"}'),
  ('footer', '{"text":"CIVILION 1949. Teknik Sipil dan Lingkungan UGM."}')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.admin_users (email)
values ('admin@gmail.com')
on conflict (email) do nothing;
