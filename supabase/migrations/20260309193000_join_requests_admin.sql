-- Solicitudes de alta para gestion centralizada desde el panel admin.

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  venue_name text not null,
  business_type text,
  area text,
  address text,
  venue_phone text,
  venue_email text,
  website text,
  contact_name text,
  contact_phone text,
  contact_email text,
  service_type text,
  message text,
  privacy_accepted boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists join_requests_status_idx on public.join_requests (status);
create index if not exists join_requests_created_at_idx on public.join_requests (created_at desc);

alter table public.join_requests enable row level security;

drop policy if exists "Public can insert join requests (MVP)" on public.join_requests;
create policy "Public can insert join requests (MVP)"
on public.join_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated admins can read join requests (MVP)" on public.join_requests;
create policy "Authenticated admins can read join requests (MVP)"
on public.join_requests
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can update join requests (MVP)" on public.join_requests;
create policy "Authenticated admins can update join requests (MVP)"
on public.join_requests
for update
to authenticated
using (true)
with check (true);
