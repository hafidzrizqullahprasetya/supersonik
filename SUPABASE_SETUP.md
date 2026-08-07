# Supabase Setup

1. Buka Supabase **SQL Editor**, jalankan seluruh isi `supabase-schema.sql`.
2. Buka **Authentication > Users**, buat user admin dengan email/password.
3. Jalankan SQL ini dengan email yang sama:

```sql
insert into public.admin_users (email)
values ('email-admin-kamu@example.com')
on conflict (email) do nothing;
```

4. Buka `/admin.html`, login, lalu tekan **Import 28 default**.
5. Ubah settings, lirik, URL audio, judul, urutan, atau status publish dari panel.

`supabase-config.js` hanya berisi URL dan publishable key. Jangan pernah memasukkan database password atau `service_role` key ke file frontend.
