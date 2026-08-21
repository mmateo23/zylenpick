begin;

alter table public.venues
  add column if not exists capture_method text not null default 'admin',
  add column if not exists capture_status text not null default 'complete',
  add column if not exists captured_by uuid references auth.users(id) on delete set null,
  add column if not exists location_accuracy_m integer,
  add column if not exists scout_note text,
  add column if not exists observed_hours text;

alter table public.menu_items
  add column if not exists capture_method text not null default 'admin',
  add column if not exists capture_status text not null default 'complete',
  add column if not exists captured_by uuid references auth.users(id) on delete set null,
  add column if not exists capture_latitude numeric,
  add column if not exists capture_longitude numeric,
  add column if not exists location_accuracy_m integer,
  add column if not exists scout_note text;

alter table public.venues
  drop constraint if exists venues_capture_method_check,
  drop constraint if exists venues_capture_status_check,
  drop constraint if exists venues_location_accuracy_check;

alter table public.venues
  add constraint venues_capture_method_check
    check (capture_method in ('admin', 'scout')),
  add constraint venues_capture_status_check
    check (capture_status in ('pending', 'complete')),
  add constraint venues_location_accuracy_check
    check (location_accuracy_m is null or location_accuracy_m >= 0);

alter table public.menu_items
  drop constraint if exists menu_items_capture_method_check,
  drop constraint if exists menu_items_capture_status_check,
  drop constraint if exists menu_items_capture_latitude_check,
  drop constraint if exists menu_items_capture_longitude_check,
  drop constraint if exists menu_items_location_accuracy_check;

alter table public.menu_items
  add constraint menu_items_capture_method_check
    check (capture_method in ('admin', 'scout')),
  add constraint menu_items_capture_status_check
    check (capture_status in ('pending', 'complete')),
  add constraint menu_items_capture_latitude_check
    check (capture_latitude is null or capture_latitude between -90 and 90),
  add constraint menu_items_capture_longitude_check
    check (capture_longitude is null or capture_longitude between -180 and 180),
  add constraint menu_items_location_accuracy_check
    check (location_accuracy_m is null or location_accuracy_m >= 0);

create index if not exists idx_venues_scout_pending
  on public.venues (created_at desc)
  where capture_method = 'scout' and capture_status = 'pending';

create index if not exists idx_menu_items_scout_pending
  on public.menu_items (venue_id, created_at desc)
  where capture_method = 'scout' and capture_status = 'pending';

comment on column public.venues.capture_status is
  'Scout captures remain pending and non-public until their full admin form is reviewed.';
comment on column public.menu_items.capture_status is
  'Scout captures remain pending and unavailable until their full admin form is reviewed.';
comment on column public.menu_items.capture_latitude is
  'Optional device latitude recorded during field capture; public location comes from the venue.';
comment on column public.menu_items.capture_longitude is
  'Optional device longitude recorded during field capture; public location comes from the venue.';

commit;
