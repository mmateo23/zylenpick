alter table public.map_places
  add column if not exists thumbnail_image_url text;

comment on column public.map_places.thumbnail_image_url is
  'Public URL for the lightweight 480px WebP used in admin listings.';
