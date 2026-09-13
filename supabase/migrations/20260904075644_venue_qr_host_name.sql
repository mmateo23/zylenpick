alter table public.venues
  add column if not exists qr_host_name text;

comment on column public.venues.qr_host_name is
  'Optional first name shown in the venue QR experience as the person available to help.';
