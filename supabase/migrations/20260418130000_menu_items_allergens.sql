alter table public.menu_items
add column if not exists allergens text[] not null default '{}';

alter table public.menu_items
drop constraint if exists menu_items_allergens_allowed_check;

alter table public.menu_items
add constraint menu_items_allergens_allowed_check
check (
  allergens <@ array[
    'gluten',
    'crustaceos',
    'huevo',
    'pescado',
    'cacahuetes',
    'soja',
    'leche',
    'frutos_de_cascara',
    'apio',
    'mostaza',
    'sesamo',
    'sulfitos',
    'altramuces',
    'moluscos'
  ]::text[]
);
