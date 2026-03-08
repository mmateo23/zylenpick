alter table public.venues
  add column if not exists website text;

insert into public.cities (
  id,
  slug,
  name,
  region,
  is_active
)
values (
  '55555555-5555-5555-5555-555555555555',
  'talavera-de-la-reina',
  'Talavera de la Reina',
  'Castilla-La Mancha',
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  region = excluded.region,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

insert into public.venues (
  id,
  city_id,
  slug,
  name,
  description,
  website,
  cover_url,
  logo_url,
  address,
  email,
  pickup_notes,
  pickup_eta_min,
  is_active
)
values (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  'la-comida-de-los-dados',
  'La Comida de los Dados',
  'Comida casera preparada para recoger en Talavera de la Reina.',
  'https://lacomidadelosdados.com',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=300&q=80',
  null,
  'pedidos@lacomidadelosdados.com',
  'Recoge tu pedido en el local cuando este listo.',
  20,
  true
)
on conflict (slug) do update
set
  city_id = excluded.city_id,
  name = excluded.name,
  description = excluded.description,
  website = excluded.website,
  cover_url = excluded.cover_url,
  logo_url = excluded.logo_url,
  address = excluded.address,
  email = excluded.email,
  pickup_notes = excluded.pickup_notes,
  pickup_eta_min = excluded.pickup_eta_min,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

delete from public.menu_items
where venue_id = '66666666-6666-6666-6666-666666666666'
  and id not in (
    '88888888-8888-8888-8888-888888888881',
    '88888888-8888-8888-8888-888888888882',
    '88888888-8888-8888-8888-888888888883',
    '88888888-8888-8888-8888-888888888884',
    '88888888-8888-8888-8888-888888888885'
  );

insert into public.menu_items (
  id,
  venue_id,
  name,
  description,
  price_amount,
  currency,
  image_url,
  category_name,
  sort_order,
  is_available
)
values
  (
    '88888888-8888-8888-8888-888888888881',
    '66666666-6666-6666-6666-666666666666',
    'Croquetas de jamon',
    'Croquetas caseras cremosas con jamon iberico.',
    850,
    'EUR',
    'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80',
    'Entrantes',
    1,
    true
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    '66666666-6666-6666-6666-666666666666',
    'Dados bravos de patata',
    'Patatas bravas crujientes con salsa de la casa.',
    650,
    'EUR',
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=80',
    'Entrantes',
    2,
    true
  ),
  (
    '88888888-8888-8888-8888-888888888883',
    '66666666-6666-6666-6666-666666666666',
    'Arroz meloso de carrillera',
    'Arroz meloso con carrillera de cerdo cocinada a fuego lento.',
    1250,
    'EUR',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
    'Platos principales',
    3,
    true
  ),
  (
    '88888888-8888-8888-8888-888888888884',
    '66666666-6666-6666-6666-666666666666',
    'Burger de vaca madurada',
    'Hamburguesa de vaca madurada con pan brioche y queso.',
    1150,
    'EUR',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    'Platos principales',
    4,
    true
  ),
  (
    '88888888-8888-8888-8888-888888888885',
    '66666666-6666-6666-6666-666666666666',
    'Tarta de queso tostada',
    'Tarta de queso cremosa con superficie caramelizada.',
    550,
    'EUR',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
    'Postres',
    5,
    true
  )
on conflict (id) do update
set
  venue_id = excluded.venue_id,
  name = excluded.name,
  description = excluded.description,
  price_amount = excluded.price_amount,
  currency = excluded.currency,
  image_url = excluded.image_url,
  category_name = excluded.category_name,
  sort_order = excluded.sort_order,
  is_available = excluded.is_available,
  updated_at = timezone('utc', now());
