create table if not exists public.venue_monetization_settings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  is_paying boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'basic', 'oro', 'titanio')),
  billing_cycle text null check (billing_cycle in ('monthly', 'annual')),
  privileges jsonb not null default '{"quickDecision": false, "featuredFeed": false, "promotionalChips": false}'::jsonb,
  starts_at timestamptz null,
  ends_at timestamptz null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint venue_monetization_settings_venue_id_key unique (venue_id)
);

create index if not exists venue_monetization_settings_venue_id_idx
  on public.venue_monetization_settings (venue_id);

create index if not exists venue_monetization_settings_plan_idx
  on public.venue_monetization_settings (plan);

create trigger venue_monetization_settings_set_updated_at
  before update on public.venue_monetization_settings
  for each row
  execute function public.set_updated_at();

alter table public.venue_monetization_settings enable row level security;

drop policy if exists "Public can read venue monetization settings" on public.venue_monetization_settings;

create policy "Public can read venue monetization settings"
  on public.venue_monetization_settings
  for select
  using (true);
