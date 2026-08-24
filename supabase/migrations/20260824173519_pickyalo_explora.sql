begin;

create table if not exists public.explore_sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  short_message text,
  link_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint explore_sponsors_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint explore_sponsors_date_range_check
    check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists public.explore_routes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete restrict,
  sponsor_id uuid references public.explore_sponsors(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  cover_image_url text,
  status text not null default 'draft',
  sort_order integer not null default 100,
  available_languages text[] not null default array['es']::text[],
  credits text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint explore_routes_slug_key unique (slug),
  constraint explore_routes_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint explore_routes_status_check
    check (status in ('draft', 'published')),
  constraint explore_routes_languages_check
    check (cardinality(available_languages) > 0),
  constraint explore_routes_published_content_check
    check (
      status <> 'published'
      or (
        char_length(btrim(name)) > 0
        and description is not null and char_length(btrim(description)) > 0
        and cover_image_url is not null and char_length(btrim(cover_image_url)) > 0
        and reviewed_at is not null
      )
    )
);

create table if not exists public.explore_route_points (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.explore_routes(id) on delete cascade,
  map_place_id uuid not null references public.map_places(id) on delete restrict,
  sponsor_id uuid references public.explore_sponsors(id) on delete set null,
  slug text not null,
  position integer not null default 1,
  title text not null,
  introduction text,
  story text,
  transcript text,
  audio_url text,
  audio_duration_seconds integer,
  image_url text,
  image_alt text,
  artistic_map_url text,
  latitude double precision,
  longitude double precision,
  credits text,
  translations jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  is_published boolean not null default false,
  public_token uuid not null default gen_random_uuid(),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint explore_route_points_route_slug_key unique (route_id, slug),
  constraint explore_route_points_route_position_key unique (route_id, position),
  constraint explore_route_points_public_token_key unique (public_token),
  constraint explore_route_points_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint explore_route_points_position_check check (position > 0),
  constraint explore_route_points_audio_duration_check
    check (audio_duration_seconds is null or audio_duration_seconds >= 0),
  constraint explore_route_points_latitude_check
    check (latitude is null or latitude between -90 and 90),
  constraint explore_route_points_longitude_check
    check (longitude is null or longitude between -180 and 180),
  constraint explore_route_points_coordinates_check
    check ((latitude is null) = (longitude is null)),
  constraint explore_route_points_published_content_check
    check (
      is_published = false
      or (
        is_active = true
        and char_length(btrim(title)) > 0
        and introduction is not null and char_length(btrim(introduction)) > 0
        and story is not null and char_length(btrim(story)) > 0
        and transcript is not null and char_length(btrim(transcript)) > 0
        and image_url is not null and char_length(btrim(image_url)) > 0
        and image_alt is not null and char_length(btrim(image_alt)) > 0
        and latitude is not null
        and longitude is not null
        and reviewed_at is not null
      )
    )
);

create index if not exists explore_routes_public_lookup_idx
  on public.explore_routes (status, city_id, sort_order);

create index if not exists explore_route_points_route_order_idx
  on public.explore_route_points (route_id, is_published, is_active, position);

create index if not exists explore_route_points_place_idx
  on public.explore_route_points (map_place_id);

create index if not exists explore_sponsors_public_lookup_idx
  on public.explore_sponsors (is_active, starts_at, ends_at);

create or replace function public.move_explore_route_point(
  p_route_id uuid,
  p_point_id uuid,
  p_direction text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_position integer;
  target_id uuid;
  target_position integer;
  temporary_position integer;
begin
  if p_direction not in ('up', 'down') then
    raise exception 'Invalid direction';
  end if;

  select position
  into current_position
  from public.explore_route_points
  where id = p_point_id and route_id = p_route_id;

  if current_position is null then
    return;
  end if;

  if p_direction = 'up' then
    select id, position
    into target_id, target_position
    from public.explore_route_points
    where route_id = p_route_id and position < current_position
    order by position desc
    limit 1;
  else
    select id, position
    into target_id, target_position
    from public.explore_route_points
    where route_id = p_route_id and position > current_position
    order by position asc
    limit 1;
  end if;

  if target_id is null then
    return;
  end if;

  select coalesce(max(position), 0) + 1000
  into temporary_position
  from public.explore_route_points
  where route_id = p_route_id;

  update public.explore_route_points
  set position = temporary_position
  where id = p_point_id and route_id = p_route_id;

  update public.explore_route_points
  set position = current_position
  where id = target_id and route_id = p_route_id;

  update public.explore_route_points
  set position = target_position
  where id = p_point_id and route_id = p_route_id;
end;
$$;

revoke all on function public.move_explore_route_point(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.move_explore_route_point(uuid, uuid, text) to service_role;

drop trigger if exists explore_sponsors_set_updated_at on public.explore_sponsors;
create trigger explore_sponsors_set_updated_at
before update on public.explore_sponsors
for each row execute function public.set_updated_at();

drop trigger if exists explore_routes_set_updated_at on public.explore_routes;
create trigger explore_routes_set_updated_at
before update on public.explore_routes
for each row execute function public.set_updated_at();

drop trigger if exists explore_route_points_set_updated_at on public.explore_route_points;
create trigger explore_route_points_set_updated_at
before update on public.explore_route_points
for each row execute function public.set_updated_at();

alter table public.explore_sponsors enable row level security;
alter table public.explore_routes enable row level security;
alter table public.explore_route_points enable row level security;

drop policy if exists "Public can read active explore sponsors" on public.explore_sponsors;
create policy "Public can read active explore sponsors"
on public.explore_sponsors
for select
to anon, authenticated
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Public can read published explore routes" on public.explore_routes;
create policy "Public can read published explore routes"
on public.explore_routes
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.cities
    where public.cities.id = public.explore_routes.city_id
      and public.cities.is_active = true
  )
);

drop policy if exists "Public can read published explore route points" on public.explore_route_points;
create policy "Public can read published explore route points"
on public.explore_route_points
for select
to anon, authenticated
using (
  is_published = true
  and is_active = true
  and exists (
    select 1
    from public.explore_routes
    where public.explore_routes.id = public.explore_route_points.route_id
      and public.explore_routes.status = 'published'
  )
  and exists (
    select 1
    from public.map_places
    where public.map_places.id = public.explore_route_points.map_place_id
      and public.map_places.status = 'published'
      and public.map_places.is_active = true
  )
);

revoke all privileges on table public.explore_sponsors from public, anon, authenticated;
revoke all privileges on table public.explore_routes from public, anon, authenticated;
revoke all privileges on table public.explore_route_points from public, anon, authenticated;

grant select on table public.explore_sponsors to anon, authenticated;
grant select on table public.explore_routes to anon, authenticated;
grant select on table public.explore_route_points to anon, authenticated;

grant all privileges on table public.explore_sponsors to service_role;
grant all privileges on table public.explore_routes to service_role;
grant all privileges on table public.explore_route_points to service_role;

comment on table public.explore_routes is
  'Published cultural routes presented through Pickyalo Explora.';
comment on table public.explore_route_points is
  'Ordered route-specific editorial experiences linked to verified map places.';
comment on column public.explore_route_points.public_token is
  'Non-secret QR identifier. RLS still limits public reads to published content.';
comment on column public.explore_route_points.translations is
  'Reserved locale-keyed content for future translations; Spanish fields remain canonical in the MVP.';

commit;
