alter table public.venues
  add column if not exists show_on_map boolean not null default false,
  add column if not exists use_custom_map_marker boolean not null default false,
  add column if not exists map_marker_logo_url text null;

update public.venues
set show_on_map = true
where subscription_active = true;

comment on column public.venues.show_on_map is
  'Admin-controlled visibility of an eligible venue on the public map.';

comment on column public.venues.use_custom_map_marker is
  'Uses the venue map marker logo when the venue has an active subscription.';

comment on column public.venues.map_marker_logo_url is
  'Public URL for the optional transparent PNG used as the venue map marker.';
