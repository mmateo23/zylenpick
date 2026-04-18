create table if not exists public.site_design_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_design_settings_key_check check (
    key in ('texts', 'media', 'zones')
  )
);

drop trigger if exists site_design_settings_set_updated_at on public.site_design_settings;
create trigger site_design_settings_set_updated_at
before update on public.site_design_settings
for each row
execute function public.set_updated_at();

alter table public.site_design_settings enable row level security;

drop policy if exists "Site design settings are viewable by everyone" on public.site_design_settings;
create policy "Site design settings are viewable by everyone"
on public.site_design_settings
for select
using (true);

insert into public.site_design_settings (key, value)
values
  ('texts', '{}'::jsonb),
  ('media', '{}'::jsonb),
  ('zones', '{}'::jsonb)
on conflict (key) do nothing;
