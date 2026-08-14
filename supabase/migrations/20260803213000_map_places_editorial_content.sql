-- Optional editorial content for places that deserve a richer discovery post.
-- Existing utility points remain valid without filling any of these fields.

begin;

alter table public.map_places
  add column if not exists cover_image_url text,
  add column if not exists story text,
  add column if not exists opening_hours_note text,
  add column if not exists accessibility_note text,
  add column if not exists source_label text,
  add column if not exists source_url text;

alter table public.map_places
  drop constraint if exists map_places_category_check;

alter table public.map_places
  add constraint map_places_category_check check (
    category in (
      'tables',
      'playground',
      'park',
      'fountain',
      'toilets',
      'monument',
      'mural',
      'viewpoint',
      'parking',
      'accessible',
      'sports',
      'event'
    )
  );

commit;
