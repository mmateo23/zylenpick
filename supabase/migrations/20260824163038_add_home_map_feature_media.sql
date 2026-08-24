alter table public.site_media_assets
drop constraint if exists site_media_assets_key_check;

alter table public.site_media_assets
add constraint site_media_assets_key_check check (
  key in (
    'home_hero',
    'dishes_hero',
    'map_hero',
    'home_map_feature',
    'join_hero',
    'project_hero',
    'project_problem',
    'project_idea',
    'project_step_discover',
    'project_step_order',
    'project_step_pickup',
    'cart_empty_hero',
    'cart_active_hero'
  )
);

insert into public.site_media_assets (key, label, description, image_url)
values (
  'home_map_feature',
  'Home - post del mapa',
  'Imagen protagonista del post que presenta el mapa en la Home.',
  '/home/zonas/badges/talavera_tile_mural.png'
)
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  image_url = coalesce(public.site_media_assets.image_url, excluded.image_url),
  updated_at = timezone('utc', now());
