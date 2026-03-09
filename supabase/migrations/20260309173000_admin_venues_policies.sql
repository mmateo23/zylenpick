-- Politicas temporales para habilitar la gestion centralizada de locales
-- desde el panel admin del MVP. Se limitan a la tabla venues.

alter table public.venues enable row level security;

drop policy if exists "Authenticated admins can read all venues (MVP)" on public.venues;
create policy "Authenticated admins can read all venues (MVP)"
on public.venues
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can insert venues (MVP)" on public.venues;
create policy "Authenticated admins can insert venues (MVP)"
on public.venues
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update venues (MVP)" on public.venues;
create policy "Authenticated admins can update venues (MVP)"
on public.venues
for update
to authenticated
using (true)
with check (true);
