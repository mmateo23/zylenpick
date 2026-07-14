alter table public.venues
  add column if not exists prices_visible boolean not null default false;

comment on column public.venues.prices_visible is
  'Controls whether confirmed prices are public and products from the venue can be added to the cart.';
