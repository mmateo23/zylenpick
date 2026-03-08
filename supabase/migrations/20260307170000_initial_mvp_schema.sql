create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  cover_url text,
  logo_url text,
  delivery_time_min integer,
  delivery_time_max integer,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  description text,
  price_amount integer not null check (price_amount >= 0),
  currency text not null default 'EUR',
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  title text not null,
  caption text,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  poster_url text,
  likes_count integer not null default 0 check (likes_count >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  venue_id uuid not null references public.venues(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists carts_one_active_session_idx
  on public.carts(session_id)
  where status = 'active';

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_amount integer not null check (unit_price_amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (cart_id, menu_item_id)
);

drop trigger if exists venues_set_updated_at on public.venues;
create trigger venues_set_updated_at
before update on public.venues
for each row
execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
before update on public.menu_items
for each row
execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
before update on public.carts
for each row
execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

insert into public.venues (
  id,
  slug,
  name,
  description,
  delivery_time_min,
  delivery_time_max,
  cover_url
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'la-esquina-brava',
    'La Esquina Brava',
    'Tacos intensos y comida callejera con mucho sabor.',
    18,
    22,
    'https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'barrio-burger-club',
    'Barrio Burger Club',
    'Smash burgers, sides crujientes y recetas directas al antojo.',
    20,
    25,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'kitsune-noodle-bar',
    'Kitsune Noodle Bar',
    'Ramen caliente y platos reconfortantes para cualquier hora.',
    24,
    28,
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'maison-brunch',
    'Maison Brunch',
    'Brunch visual, cafe y piezas dulces para compartir.',
    10,
    15,
    'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (id) do nothing;

insert into public.menu_items (
  id,
  venue_id,
  name,
  description,
  price_amount,
  image_url
)
values
  (
    'aaaaaaa1-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Taco de birria con consome',
    'Carne cocinada a fuego lento, queso fundido y caldo especiado.',
    890,
    'https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'aaaaaaa2-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Smash burger doble cheddar',
    'Pan brioche tostado, cebolla a la plancha y salsa de la casa.',
    1250,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'aaaaaaa3-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Patatas trufadas con parmesano',
    'Crujientes por fuera y terminadas con trufa y queso rallado.',
    640,
    'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'aaaaaaa4-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'Ramen picante de miso',
    'Caldo profundo, huevo marinado y noodles frescos.',
    1320,
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'aaaaaaa5-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'Croissant relleno de pollo y miel',
    'Brunch salado con capas crujientes y salsa cremosa.',
    780,
    'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'aaaaaaa6-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'Roll caliente de canela',
    'Masa tierna y aroma a mantequilla con glaseado ligero.',
    490,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (id) do nothing;

insert into public.posts (
  id,
  venue_id,
  menu_item_id,
  title,
  caption,
  media_type,
  media_url,
  poster_url,
  likes_count,
  status,
  sort_order
)
values
  (
    'bbbbbbb1-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaa1-1111-1111-1111-111111111111',
    'Taco de birria con consome',
    'Carne cocinada a fuego lento, queso fundido y caldo especiado para mojar cada bocado.',
    'image',
    'https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1200&q=80',
    null,
    128,
    'published',
    1
  ),
  (
    'bbbbbbb2-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaa2-2222-2222-2222-222222222222',
    'Smash burger doble cheddar',
    'Pan brioche tostado, cebolla plancha y salsa de la casa en una hamburguesa intensa y jugosa.',
    'video',
    'https://videos.pexels.com/video-files/4255486/4255486-sd_506_960_25fps.mp4',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    264,
    'published',
    2
  ),
  (
    'bbbbbbb3-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaa3-3333-3333-3333-333333333333',
    'Patatas trufadas con parmesano',
    'Crujientes por fuera, cremosas por dentro y terminadas con aceite de trufa y queso rallado.',
    'image',
    'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1200&q=80',
    null,
    101,
    'published',
    3
  ),
  (
    'bbbbbbb4-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaa4-4444-4444-4444-444444444444',
    'Ramen picante de miso',
    'Caldo profundo, huevo marinado y noodles frescos para una comida reconfortante.',
    'image',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80',
    null,
    89,
    'published',
    4
  ),
  (
    'bbbbbbb5-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaa5-5555-5555-5555-555555555555',
    'Croissant relleno de pollo y miel',
    'Brunch salado con capas crujientes, salsa cremosa y hojas frescas para una comida ligera.',
    'video',
    'https://videos.pexels.com/video-files/6605640/6605640-sd_540_960_25fps.mp4',
    'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?auto=format&fit=crop&w=1200&q=80',
    74,
    'published',
    5
  ),
  (
    'bbbbbbb6-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaa6-6666-6666-6666-666666666666',
    'Roll caliente de canela',
    'Glaseado ligero, masa tierna y aroma a mantequilla para cerrar el feed con algo dulce.',
    'image',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    null,
    57,
    'published',
    6
  )
on conflict (id) do nothing;
