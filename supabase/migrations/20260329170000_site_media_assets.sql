create table if not exists public.site_media_assets (
  key text primary key,
  label text not null,
  description text null,
  image_url text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_media_assets_key_check check (
    key in (
      'home_hero',
      'join_hero',
      'project_hero',
      'project_problem',
      'project_idea',
      'project_step_discover',
      'project_step_order',
      'project_step_pickup'
    )
  )
);

drop trigger if exists site_media_assets_set_updated_at on public.site_media_assets;
create trigger site_media_assets_set_updated_at
before update on public.site_media_assets
for each row
execute function public.set_updated_at();

alter table public.site_media_assets enable row level security;

drop policy if exists "Site media assets are viewable by everyone" on public.site_media_assets;
create policy "Site media assets are viewable by everyone"
on public.site_media_assets
for select
using (true);

insert into public.site_media_assets (key, label, description, image_url)
values
  (
    'home_hero',
    'Home hero',
    'Imagen principal de la home y selector inicial de zona.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80'
  ),
  (
    'join_hero',
    'Unete hero',
    'Imagen principal de la pagina para captar nuevos locales.',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80'
  ),
  (
    'project_hero',
    'El proyecto hero',
    'Imagen de apertura de la pagina El proyecto.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80'
  ),
  (
    'project_problem',
    'El proyecto problema',
    'Imagen de apoyo para la seccion del problema.',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80'
  ),
  (
    'project_idea',
    'El proyecto idea',
    'Imagen de apoyo para la seccion de la idea.',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80'
  ),
  (
    'project_step_discover',
    'El proyecto descubre',
    'Imagen del paso Descubre.',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'project_step_order',
    'El proyecto pide',
    'Imagen del paso Pide.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'project_step_pickup',
    'El proyecto recoge',
    'Imagen del paso Recoge.',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  image_url = coalesce(public.site_media_assets.image_url, excluded.image_url),
  updated_at = timezone('utc', now());
