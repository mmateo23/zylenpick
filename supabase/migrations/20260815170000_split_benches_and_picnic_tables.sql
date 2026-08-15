-- Keep standalone benches separate from picnic tables in the city explorer.

begin;

alter table public.map_places
  drop constraint if exists map_places_category_check;

alter table public.map_places
  add constraint map_places_category_check check (
    category in (
      'bench',
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

update public.map_places
set category = 'bench',
    icon_name = 'bench'
where category = 'tables'
  and 'Banco' = any(amenities);

commit;
