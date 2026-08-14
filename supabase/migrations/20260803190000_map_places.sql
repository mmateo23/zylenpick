-- Curated public places and small map areas managed by Pickyalo.
-- The first UI only creates points. geometry is reserved for future
-- polygons and routes without requiring another data model.

begin;

create table if not exists public.map_places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  parent_place_id uuid references public.map_places(id) on delete set null,
  slug text not null,
  name text not null,
  description text,
  category text not null check (
    category in (
      'tables',
      'playground',
      'park',
      'fountain',
      'toilets',
      'monument',
      'viewpoint',
      'parking',
      'accessible',
      'sports',
      'event'
    )
  ),
  icon_name text not null,
  geometry_type text not null default 'point' check (
    geometry_type in ('point', 'polygon', 'line')
  ),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  geometry jsonb,
  location_accuracy_m integer check (
    location_accuracy_m is null or location_accuracy_m >= 0
  ),
  amenities text[] not null default '{}',
  is_accessible boolean not null default false,
  source text not null default 'field' check (
    source in ('field', 'municipal', 'openstreetmap', 'manual')
  ),
  source_note text,
  status text not null default 'draft' check (
    status in ('draft', 'review', 'published')
  ),
  is_active boolean not null default true,
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (city_id, slug)
);

create index if not exists map_places_public_lookup_idx
  on public.map_places (city_id, status, is_active, sort_order);

create index if not exists map_places_coordinates_idx
  on public.map_places (latitude, longitude);

drop trigger if exists map_places_set_updated_at on public.map_places;
create trigger map_places_set_updated_at
before update on public.map_places
for each row
execute function public.set_updated_at();

alter table public.map_places enable row level security;

drop policy if exists "Public can read published map places"
  on public.map_places;
create policy "Public can read published map places"
on public.map_places
for select
to anon, authenticated
using (
  status = 'published'
  and is_active = true
  and exists (
    select 1
    from public.cities
    where public.cities.id = public.map_places.city_id
      and public.cities.is_active = true
  )
);

revoke all privileges on table public.map_places
from public, anon, authenticated;
grant select on table public.map_places to anon, authenticated;
grant all privileges on table public.map_places to service_role;

commit;
