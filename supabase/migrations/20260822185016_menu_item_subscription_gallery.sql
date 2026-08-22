alter table public.menu_items
  add column if not exists gallery_image_urls text[] not null default '{}';

alter table public.menu_items
  drop constraint if exists menu_items_gallery_image_urls_limit;

alter table public.menu_items
  add constraint menu_items_gallery_image_urls_limit
  check (cardinality(gallery_image_urls) <= 2);

comment on column public.menu_items.gallery_image_urls is
  'Up to two additional product images. Public display is gated by the venue subscription.';
