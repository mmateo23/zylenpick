alter table public.venues
  add column if not exists qr_enabled boolean not null default true,
  add column if not exists qr_hero_image_url text,
  add column if not exists qr_show_nearby boolean not null default true;

comment on column public.venues.qr_enabled is
  'Controls whether the venue QR experience is publicly available.';

comment on column public.venues.qr_hero_image_url is
  'Optional ambience/interior image used before the venue cover and featured dish fallbacks.';

comment on column public.venues.qr_show_nearby is
  'Controls whether nearby city discovery is shown in the venue QR experience.';
