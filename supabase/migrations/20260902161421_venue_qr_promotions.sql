create table if not exists public.venue_qr_promotions (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null unique references public.venues(id) on delete cascade,
  is_enabled boolean not null default false,
  brand_name text not null default '',
  headline text not null default '',
  description text not null default '',
  image_url text,
  related_menu_item_id uuid references public.menu_items(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venue_qr_promotions_dates_check check (
    starts_at is null or ends_at is null or starts_at <= ends_at
  ),
  constraint venue_qr_promotions_enabled_content_check check (
    not is_enabled or (
      char_length(btrim(brand_name)) > 0 and
      char_length(btrim(headline)) > 0 and
      char_length(btrim(description)) > 0
    )
  )
);

drop trigger if exists venue_qr_promotions_set_updated_at
  on public.venue_qr_promotions;
create trigger venue_qr_promotions_set_updated_at
before update on public.venue_qr_promotions
for each row execute function public.set_updated_at();

alter table public.venue_qr_promotions enable row level security;

revoke all on table public.venue_qr_promotions from anon, authenticated;
grant select on table public.venue_qr_promotions to anon, authenticated;

drop policy if exists "Public can read active QR promotions"
  on public.venue_qr_promotions;
create policy "Public can read active QR promotions"
on public.venue_qr_promotions
for select
to anon, authenticated
using (
  is_enabled
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  and exists (
    select 1
    from public.venues
    where venues.id = venue_qr_promotions.venue_id
      and venues.is_active
      and venues.is_published
      and venues.qr_enabled
  )
);

comment on table public.venue_qr_promotions is
  'Single optional editorial promotion displayed in a venue QR experience.';
