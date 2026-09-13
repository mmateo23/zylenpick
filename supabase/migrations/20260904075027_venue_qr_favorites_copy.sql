alter table public.venues
  add column if not exists qr_favorites_eyebrow text not null default 'Si dudas, empieza aquí',
  add column if not exists qr_favorites_title text not null default 'Los favoritos.',
  add column if not exists qr_favorites_description text not null default 'Pide con los ojos. Mira lo mejor de la casa y pídeselo al personal.';

comment on column public.venues.qr_favorites_eyebrow is
  'Short label shown above the QR featured dishes section.';

comment on column public.venues.qr_favorites_title is
  'Heading shown above the QR featured dishes section.';

comment on column public.venues.qr_favorites_description is
  'Supporting copy shown above the QR featured dishes section.';
