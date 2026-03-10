alter table public.join_requests
  add column if not exists linked_venue_id uuid references public.venues(id) on delete set null;

create index if not exists join_requests_linked_venue_id_idx
  on public.join_requests (linked_venue_id);
