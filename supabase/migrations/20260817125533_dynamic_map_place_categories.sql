begin;

create table if not exists public.map_place_categories (
  slug text primary key,
  name text not null,
  icon_name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint map_place_categories_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint map_place_categories_name_length_check
    check (char_length(name) between 1 and 80),
  constraint map_place_categories_icon_name_length_check
    check (char_length(icon_name) between 1 and 80)
);

insert into public.map_place_categories (slug, name, icon_name, sort_order)
values
  ('bench', 'Banco', 'Armchair', 10),
  ('tables', 'Mesa con bancos', 'Table2', 20),
  ('playground', 'Parque infantil', 'Blocks', 30),
  ('park', 'Parque o zona verde', 'TreePine', 40),
  ('fountain', 'Fuente', 'Droplets', 50),
  ('toilets', 'Aseos', 'Toilet', 60),
  ('monument', 'Monumento', 'Landmark', 70),
  ('mural', 'Mural y arte urbano', 'Palette', 80),
  ('viewpoint', 'Mirador', 'Eye', 90),
  ('parking', 'Aparcamiento', 'CircleParking', 100),
  ('accessible', 'Acceso adaptado', 'Accessibility', 110),
  ('sports', 'Zona deportiva', 'Activity', 120),
  ('event', 'Espacio de eventos', 'CalendarDays', 130)
on conflict (slug) do nothing;

alter table public.map_places
  drop constraint if exists map_places_category_check;

update public.map_places as place
set icon_name = category.icon_name
from public.map_place_categories as category
where category.slug = place.category
  and place.icon_name is distinct from category.icon_name;

alter table public.map_places
  drop constraint if exists map_places_category_fkey;

alter table public.map_places
  add constraint map_places_category_fkey
  foreign key (category)
  references public.map_place_categories(slug)
  on update cascade
  on delete restrict;

create or replace function public.sync_map_place_category_icon()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select icon_name into new.icon_name
  from public.map_place_categories
  where slug = new.category;
  return new;
end;
$$;

drop trigger if exists map_places_sync_category_icon on public.map_places;
create trigger map_places_sync_category_icon
before insert or update of category on public.map_places
for each row execute function public.sync_map_place_category_icon();

create or replace function public.sync_category_icon_to_map_places()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.icon_name is distinct from old.icon_name then
    update public.map_places
    set icon_name = new.icon_name
    where category = new.slug;
  end if;
  return new;
end;
$$;

drop trigger if exists map_place_categories_sync_places on public.map_place_categories;
create trigger map_place_categories_sync_places
after update of icon_name on public.map_place_categories
for each row execute function public.sync_category_icon_to_map_places();

drop trigger if exists map_place_categories_set_updated_at on public.map_place_categories;
create trigger map_place_categories_set_updated_at
before update on public.map_place_categories
for each row execute function public.set_updated_at();

alter table public.map_place_categories enable row level security;

drop policy if exists "Public can read active map place categories"
  on public.map_place_categories;
create policy "Public can read active map place categories"
on public.map_place_categories
for select
to anon, authenticated
using (is_active = true);

revoke all privileges on table public.map_place_categories
from public, anon, authenticated;
grant select on table public.map_place_categories to anon, authenticated;
grant all privileges on table public.map_place_categories to service_role;

revoke all on function public.sync_map_place_category_icon() from public;
revoke all on function public.sync_category_icon_to_map_places() from public;

commit;
