create table if not exists public.site_funnel_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_funnel_settings_key_check check (
    key in ('platos')
  )
);

drop trigger if exists site_funnel_settings_set_updated_at on public.site_funnel_settings;
create trigger site_funnel_settings_set_updated_at
before update on public.site_funnel_settings
for each row
execute function public.set_updated_at();

alter table public.site_funnel_settings enable row level security;

drop policy if exists "Site funnel settings are viewable by everyone" on public.site_funnel_settings;
create policy "Site funnel settings are viewable by everyone"
on public.site_funnel_settings
for select
using (true);

insert into public.site_funnel_settings (key, value)
values ('platos', '{}'::jsonb)
on conflict (key) do nothing;
