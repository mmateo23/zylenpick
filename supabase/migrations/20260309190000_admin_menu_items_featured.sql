-- Soporte minimo para gestion centralizada de platos desde panel admin
-- y politicas temporales de MVP para menu_items.

alter table public.menu_items
  add column if not exists is_featured boolean not null default false;

alter table public.menu_items enable row level security;

drop policy if exists "Authenticated admins can read all menu items (MVP)" on public.menu_items;
create policy "Authenticated admins can read all menu items (MVP)"
on public.menu_items
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can insert menu items (MVP)" on public.menu_items;
create policy "Authenticated admins can insert menu items (MVP)"
on public.menu_items
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update menu items (MVP)" on public.menu_items;
create policy "Authenticated admins can update menu items (MVP)"
on public.menu_items
for update
to authenticated
using (true)
with check (true);
