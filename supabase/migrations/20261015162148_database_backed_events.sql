-- Event content is managed independently of deployments. Public reads only;
-- editorial writes use the existing trusted Supabase management connection.
create table public.events (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  city_id uuid not null references public.cities(id),
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'archived')),
  title text not null check (length(btrim(title)) > 0),
  short_title text not null,
  eyebrow text not null,
  summary text not null,
  description text not null,
  starts_on date not null,
  ends_on date not null,
  location_label text not null,
  venue_note text,
  access_label text not null,
  access_note text,
  organizer text not null,
  website_url text not null check (website_url ~ '^https?://'),
  source_url text not null check (source_url ~ '^https?://'),
  source_label text not null,
  verified_on date not null,
  image_url text check (image_url is null or image_url ~ '^https?://' or image_url ~ '^/[^/]'),
  home_image_url text check (home_image_url is null or home_image_url ~ '^https?://' or home_image_url ~ '^/[^/]'),
  image_alt text,
  tickets_url text check (tickets_url is null or tickets_url ~ '^https?://'),
  directions_url text check (directions_url is null or directions_url ~ '^https?://'),
  tags text[] not null default '{}',
  highlights text[] not null default '{}',
  schedule jsonb not null default '[]' check (jsonb_typeof(schedule) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_check check (ends_on >= starts_on)
);

create index events_city_id_idx on public.events(city_id);
create index events_published_dates_idx on public.events(starts_on, slug) where status = 'published';
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant select on public.events to anon, authenticated;
grant all on public.events to service_role;
create policy "Public can read published events" on public.events
for select to anon, authenticated
using (status = 'published' and exists (
  select 1 from public.cities where cities.id = events.city_id and cities.is_active
));

comment on table public.events is
  'Verified editorial events. Drafts, cancellations and archived records are never exposed publicly. Past published details remain accessible; upcoming lists filter by Madrid date.';
