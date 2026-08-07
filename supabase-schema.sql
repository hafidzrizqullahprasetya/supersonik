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
  ('hero', '{"eyebrow":"Collaboration from Teknik UGM","title":"CHANT","title_emphasis":"SUPERSONIK","description":"Kumpulan chant untuk dinyanyikan bersama. Pilih lagu, tekan play, dan nyalakan suara dari tribun.","background_url":"hero-bg.webp","location":"Teknik UGM, Yogyakarta"}'),
  ('release', '{"eyebrow":"Koleksi chant","title":"NYALAKAN","title_emphasis":"TRIBUNMU.","cover_label":"SUPERSONIK","cover_title":"CHANT COLLECTION"}'),
  ('branding', '{"logo_url":"logo-supersonik.png","collaborator_logo_url":"logo-logo.png","source_url":"https://sites.google.com/mail.ugm.ac.id/chantsupersonik2024/home"}'),
  ('footer', '{"text":"Supersonik. Koleksi chant Teknik UGM."}')
on conflict (key) do nothing;

-- Setelah membuat user di Authentication > Users, jalankan:
-- insert into public.admin_users (email) values ('email-admin-kamu@example.com') on conflict (email) do nothing;
