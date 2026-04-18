alter table public.venues
add column if not exists is_featured boolean not null default false;

alter table public.menu_items
add column if not exists is_home_featured boolean not null default false;
