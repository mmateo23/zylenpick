alter table public.menu_items
add column if not exists is_pickup_month_highlight boolean not null default false;
