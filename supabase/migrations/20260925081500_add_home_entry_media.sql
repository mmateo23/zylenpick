alter table public.site_media_assets
drop constraint if exists site_media_assets_key_check;

alter table public.site_media_assets
add constraint site_media_assets_key_check check (
  key in (
    'home_hero',
    'home_map_feature',
    'home_entry_commerce',
    'home_entry_discover',
    'home_entry_events',
    'dishes_hero',
    'map_hero',
    'join_hero',
    'join_plan_free',
    'join_plan_presence',
    'join_plan_visibility',
    'join_plan_growth',
    'join_showcase',
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
values
  (
    'home_entry_commerce',
    'Home · Comercios',
    'Imagen de la tarjeta que abre la selección de productos y locales.',
    '/home/assets/asset_bocadillo_calamares_transparent.png'
  ),
  (
    'home_entry_discover',
    'Home · Descubrir',
    'Imagen de la tarjeta que abre el mapa de lugares y servicios.',
    '/home/zonas/talavera-elements/talavera_torre_transparent.png'
  ),
  (
    'home_entry_events',
    'Home · Eventos',
    'Imagen de la tarjeta que abre la agenda local.',
    '/home/drive/place-08.png'
  )
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  image_url = coalesce(public.site_media_assets.image_url, excluded.image_url),
  updated_at = timezone('utc', now());
