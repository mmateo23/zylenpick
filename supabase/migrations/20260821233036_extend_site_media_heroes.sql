alter table public.site_media_assets
drop constraint if exists site_media_assets_key_check;

alter table public.site_media_assets
add constraint site_media_assets_key_check check (
  key in (
    'home_hero',
    'dishes_hero',
    'map_hero',
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

-- Keep direct admin customisations. Only align untouched legacy defaults with
-- the images currently used by the public pages.
update public.site_media_assets
set image_url = '/cart/empty-cart-talavera.jpg'
where key = 'join_hero'
  and image_url = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80';

update public.site_media_assets
set image_url = 'https://images.unsplash.com/photo-1742845834625-4c68792709f1?q=80&w=2188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
where key = 'project_hero'
  and image_url = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80';

update public.site_media_assets
set image_url = 'https://images.unsplash.com/photo-1696360089706-beac23813902?q=80&w=2210&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
where key = 'project_idea'
  and image_url = 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80';

update public.site_media_assets
set image_url = 'https://images.unsplash.com/photo-1682685795463-0674c065f315?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
where key = 'project_step_discover'
  and image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

update public.site_media_assets
set image_url = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
where key = 'project_step_order'
  and image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

update public.site_media_assets
set image_url = 'https://images.unsplash.com/photo-1531920382591-9179c11ab2d5?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
where key = 'project_step_pickup'
  and image_url = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80';

insert into public.site_media_assets (key, label, description, image_url)
values
  (
    'dishes_hero',
    'Portada de Platos',
    'Fondo del bloque principal de la seleccion de productos y platos.',
    'https://images.unsplash.com/photo-1778048840966-04589f37c525?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'map_hero',
    'Portada del Mapa',
    'Imagen visual que acompana la cabecera del explorador de mapa.',
    '/home/zonas/badges/talavera_tile_letters.png'
  ),
  (
    'join_hero',
    'Portada de Unete',
    'Imagen principal de la pagina para captar nuevos locales.',
    '/cart/empty-cart-talavera.jpg'
  ),
  (
    'project_hero',
    'El Proyecto - apertura',
    'Fondo de la primera pantalla de El Proyecto.',
    'https://images.unsplash.com/photo-1742845834625-4c68792709f1?q=80&w=2188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'project_step_discover',
    'El Proyecto - descubre',
    'Fondo del primer paso del recorrido editorial.',
    'https://images.unsplash.com/photo-1682685795463-0674c065f315?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'project_step_order',
    'El Proyecto - elige',
    'Fondo del segundo paso del recorrido editorial.',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'project_step_pickup',
    'El Proyecto - recoge',
    'Fondo del tercer paso del recorrido editorial.',
    'https://images.unsplash.com/photo-1531920382591-9179c11ab2d5?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'project_idea',
    'El Proyecto - cierre',
    'Fondo de la ultima pantalla de El Proyecto.',
    'https://images.unsplash.com/photo-1696360089706-beac23813902?q=80&w=2210&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'cart_empty_hero',
    'Cesta - vacia',
    'Fondo de la cesta cuando todavia no hay productos seleccionados.',
    '/cart/empty-cart-talavera.jpg'
  ),
  (
    'cart_active_hero',
    'Cesta - con productos',
    'Fondo de la cesta y del ticket cuando ya contiene productos.',
    'https://images.unsplash.com/photo-1528459105426-b9548367069b?q=85&w=1800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  )
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  image_url = coalesce(public.site_media_assets.image_url, excluded.image_url),
  updated_at = timezone('utc', now());
