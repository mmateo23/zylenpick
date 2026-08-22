-- Reuse the existing project media slots for the new editorial layout.
-- Custom administrator URLs are preserved; only known legacy defaults change.
insert into public.site_media_assets (key, label, description, image_url)
values
  (
    'project_step_discover',
    'El Proyecto - origen',
    'Fotografia de la seccion Pickyalo nace aqui.',
    '/cart/empty-cart-talavera.jpg'
  ),
  (
    'project_step_order',
    'El Proyecto - producto',
    'Fotografia de producto de la seccion La propuesta.',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ),
  (
    'project_step_pickup',
    'El Proyecto - ciudad',
    'Fotografia de la seccion dedicada a la ciudad.',
    '/home/zonas/talavera-poster-local.webp'
  ),
  (
    'project_idea',
    'El Proyecto - comercios',
    'Fotografia de la seccion Para los comercios.',
    '/cart/empty-cart-talavera.jpg'
  )
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  image_url = coalesce(public.site_media_assets.image_url, excluded.image_url),
  updated_at = timezone('utc', now());

update public.site_media_assets
set
  label = case key
    when 'project_step_discover' then 'El Proyecto - origen'
    when 'project_step_order' then 'El Proyecto - producto'
    when 'project_step_pickup' then 'El Proyecto - ciudad'
    when 'project_idea' then 'El Proyecto - comercios'
    else label
  end,
  description = case key
    when 'project_step_discover' then 'Fotografia de la seccion Pickyalo nace aqui.'
    when 'project_step_order' then 'Fotografia de producto de la seccion La propuesta.'
    when 'project_step_pickup' then 'Fotografia de la seccion dedicada a la ciudad.'
    when 'project_idea' then 'Fotografia de la seccion Para los comercios.'
    else description
  end
where key in (
  'project_step_discover',
  'project_step_order',
  'project_step_pickup',
  'project_idea'
);

update public.site_media_assets
set image_url = '/cart/empty-cart-talavera.jpg'
where key = 'project_step_discover'
  and image_url in (
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1682685795463-0674c065f315?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  );

update public.site_media_assets
set image_url = '/home/zonas/talavera-poster-local.webp'
where key = 'project_step_pickup'
  and image_url in (
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531920382591-9179c11ab2d5?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  );

update public.site_media_assets
set image_url = '/cart/empty-cart-talavera.jpg'
where key = 'project_idea'
  and image_url in (
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1696360089706-beac23813902?q=80&w=2210&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  );
