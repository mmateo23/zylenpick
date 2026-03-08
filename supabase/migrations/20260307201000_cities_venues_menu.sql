create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text,
  hero_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.venues
  add column if not exists city_id uuid references public.cities(id) on delete set null,
  add column if not exists address text,
  add column if not exists email text,
  add column if not exists pickup_notes text,
  add column if not exists pickup_eta_min integer;

alter table public.menu_items
  add column if not exists category_name text,
  add column if not exists sort_order integer not null default 0;

drop trigger if exists cities_set_updated_at on public.cities;
create trigger cities_set_updated_at
before update on public.cities
for each row
execute function public.set_updated_at();

alter table public.cities enable row level security;

drop policy if exists "Public can read active cities" on public.cities;
create policy "Public can read active cities"
on public.cities
for select
to anon, authenticated
using (is_active = true);

insert into public.cities (
  id,
  slug,
  name,
  region,
  hero_image_url
)
values (
  '55555555-5555-5555-5555-555555555555',
  'talavera-de-la-reina',
  'Talavera de la Reina',
  'Castilla-La Mancha',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
)
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  region = excluded.region,
  hero_image_url = excluded.hero_image_url,
  is_active = true,
  updated_at = timezone('utc', now());

insert into public.venues (
  id,
  city_id,
  slug,
  name,
  description,
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
  'Cocina casera creativa con raciones para recoger y compartir.',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=300&q=80',
  'Calle Carnicerias, 7, 45600 Talavera de la Reina',
  'pedidos@lacomidadelosdados.example',
  'Recoge tu pedido dentro del local e indica tu nombre al llegar.',
  20,
  true
)
on conflict (id) do update
set
  city_id = excluded.city_id,
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  cover_url = excluded.cover_url,
  logo_url = excluded.logo_url,
  address = excluded.address,
  email = excluded.email,
  pickup_notes = excluded.pickup_notes,
  pickup_eta_min = excluded.pickup_eta_min,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

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
    '77777777-7777-7777-7777-777777777771',
    '66666666-6666-6666-6666-666666666666',
    'Croquetas de jamon al dado',
    'Croquetas crujientes con bechamel cremosa y jamon iberico.',
    920,
    'EUR',
    'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80',
    'Starters',
    1,
    true
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '66666666-6666-6666-6666-666666666666',
    'Dados bravos de patata',
    'Patata dorada con salsa brava casera y alioli suave.',
    680,
    'EUR',
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=80',
    'Starters',
    2,
    true
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    '66666666-6666-6666-6666-666666666666',
    'Arroz meloso de carrillera',
    'Arroz meloso con carrillera iberica cocinada a fuego lento.',
    1480,
    'EUR',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
    'Mains',
    3,
    true
  ),
  (
    '77777777-7777-7777-7777-777777777774',
    '66666666-6666-6666-6666-666666666666',
    'Burger de vaca madurada',
    'Pan brioche, cheddar curado, pepinillo y salsa de la casa.',
    1320,
    'EUR',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    'Mains',
    4,
    true
  ),
  (
    '77777777-7777-7777-7777-777777777775',
    '66666666-6666-6666-6666-666666666666',
    'Tarta de queso tostada',
    'Porcion cremosa con acabado tostado y base fina.',
    590,
    'EUR',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
    'Desserts',
    5,
    true
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  price_amount = excluded.price_amount,
  currency = excluded.currency,
  image_url = excluded.image_url,
  category_name = excluded.category_name,
  sort_order = excluded.sort_order,
  is_available = excluded.is_available,
  updated_at = timezone('utc', now());
