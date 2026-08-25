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
    'join_plan_free',
    'Estar en Pickyalo',
    'Fotografia del primer plan publico para empezar sin coste.',
    '/home/zonas/talavera-poster-local.webp'
  ),
  (
    'join_plan_presence',
    'Cuidar mi presencia',
    'Fotografia del plan dedicado a mejorar la presentacion del local.',
    '/cart/empty-cart-talavera.jpg'
  ),
  (
    'join_plan_visibility',
    'Llegar a mas personas',
    'Fotografia del plan centrado en dar visibilidad a los mejores platos.',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop'
  ),
  (
    'join_plan_growth',
    'Crecer acompanado',
    'Fotografia del plan de acompanamiento continuado.',
    '/home/project/project_post_pickyalo.png'
  ),
  (
    'join_showcase',
    'Asi puede aparecer tu local',
    'Imagen del ejemplo que ensena como se presenta un producto en Pickyalo.',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop'
  )
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  image_url = coalesce(public.site_media_assets.image_url, excluded.image_url),
  updated_at = timezone('utc', now());
