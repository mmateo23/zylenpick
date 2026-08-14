-- Security hardening for the exposed public schema.
--
-- IMPORTANT: apply only after the server routes and admin read services listed
-- in the audit use a server-only service-role client. This migration
-- intentionally leaves carts, join requests, and monetization settings closed
-- to anon/authenticated clients.

begin;

-- Tables created through raw SQL do not get RLS automatically. Enable it for
-- every current table in the exposed public schema, including any table that
-- may exist remotely but is missing from the local type snapshot.
do $$
declare
  table_record record;
begin
  for table_record in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I enable row level security',
      'public',
      table_record.tablename
    );
  end loop;
end
$$;

-- Remove temporary MVP policies that treat every authenticated account as an
-- administrator.
drop policy if exists "Authenticated admins can read all venues (MVP)"
  on public.venues;
drop policy if exists "Authenticated admins can insert venues (MVP)"
  on public.venues;
drop policy if exists "Authenticated admins can update venues (MVP)"
  on public.venues;

drop policy if exists "Authenticated admins can read all menu items (MVP)"
  on public.menu_items;
drop policy if exists "Authenticated admins can insert menu items (MVP)"
  on public.menu_items;
drop policy if exists "Authenticated admins can update menu items (MVP)"
  on public.menu_items;

-- Public catalogue: only records that are deliberately visible can be read.
drop policy if exists "Public can read active cities" on public.cities;
create policy "Public can read active cities"
on public.cities
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active venues" on public.venues;
create policy "Public can read active venues"
on public.venues
for select
to anon, authenticated
using (
  is_active = true
  and is_published = true
);

drop policy if exists "Public can read available menu items"
  on public.menu_items;
create policy "Public can read available menu items"
on public.menu_items
for select
to anon, authenticated
using (
  is_available = true
  and exists (
    select 1
    from public.venues
    where public.venues.id = public.menu_items.venue_id
      and public.venues.is_active = true
      and public.venues.is_published = true
  )
);

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.venues
    where public.venues.id = public.posts.venue_id
      and public.venues.is_active = true
      and public.venues.is_published = true
  )
  and exists (
    select 1
    from public.menu_items
    where public.menu_items.id = public.posts.menu_item_id
      and public.menu_items.venue_id = public.posts.venue_id
      and public.menu_items.is_available = true
  )
);

-- Public site configuration contains presentation data only. Chips must also
-- be active; paid/internal monetization fields remain in the private table.
drop policy if exists "Site media assets are viewable by everyone"
  on public.site_media_assets;
create policy "Site media assets are viewable by everyone"
on public.site_media_assets
for select
to anon, authenticated
using (true);

drop policy if exists "Site design settings are viewable by everyone"
  on public.site_design_settings;
create policy "Site design settings are viewable by everyone"
on public.site_design_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Site funnel settings are viewable by everyone"
  on public.site_funnel_settings;
create policy "Site funnel settings are viewable by everyone"
on public.site_funnel_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Site chips are viewable by everyone"
  on public.site_chips;
drop policy if exists "Public can read active site chips"
  on public.site_chips;
create policy "Public can read active site chips"
on public.site_chips
for select
to anon, authenticated
using (is_active = true);

-- Keep personal profile and membership data scoped to the signed-in user.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can read their own memberships"
  on public.venue_memberships;
create policy "Users can read their own memberships"
on public.venue_memberships
for select
to authenticated
using (profile_id = (select auth.uid()));

-- Sensitive application data is server-only. Remove every policy, including
-- any policy created directly in the remote dashboard and not represented in
-- this repository.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (
        array[
          'carts',
          'cart_items',
          'join_requests',
          'venue_monetization_settings'
        ]
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      'public',
      policy_record.tablename
    );
  end loop;
end
$$;

-- Explicit privileges complement RLS. Anonymous/authenticated clients can only
-- read the public catalogue and active presentation settings.
revoke all privileges on table
  public.cities,
  public.venues,
  public.menu_items,
  public.posts,
  public.site_media_assets,
  public.site_design_settings,
  public.site_funnel_settings,
  public.site_chips
from public, anon, authenticated;

grant select on table
  public.cities,
  public.venues,
  public.menu_items,
  public.posts,
  public.site_media_assets,
  public.site_design_settings,
  public.site_funnel_settings,
  public.site_chips
to anon, authenticated;

-- Authenticated venue members retain the existing ownership policies. Column
-- grants prevent them from changing verification, publication, subscription,
-- featured-placement, or other centrally managed fields through the Data API.
grant update (
  name,
  description,
  cover_url,
  logo_url,
  website,
  address,
  latitude,
  longitude,
  email,
  phone,
  opening_hours,
  pickup_notes,
  pickup_eta_min,
  delivery_time_min,
  delivery_time_max
) on public.venues to authenticated;

grant insert (
  venue_id,
  name,
  description,
  price_amount,
  currency,
  image_url,
  allergens,
  category_name,
  sort_order,
  is_available
) on public.menu_items to authenticated;
grant update (
  name,
  description,
  price_amount,
  currency,
  image_url,
  allergens,
  category_name,
  sort_order,
  is_available
) on public.menu_items to authenticated;
grant delete on table public.menu_items to authenticated;

grant insert (
  venue_id,
  menu_item_id,
  title,
  caption,
  media_type,
  media_url,
  poster_url,
  status,
  sort_order
) on public.posts to authenticated;
grant update (
  menu_item_id,
  title,
  caption,
  media_type,
  media_url,
  poster_url,
  status,
  sort_order
) on public.posts to authenticated;
grant delete on table public.posts to authenticated;

revoke all privileges on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

revoke all privileges on table public.venue_memberships
from public, anon, authenticated;
grant select on table public.venue_memberships to authenticated;

revoke all privileges on table
  public.carts,
  public.cart_items,
  public.join_requests,
  public.venue_monetization_settings
from public, anon, authenticated;

grant all privileges on table
  public.carts,
  public.cart_items,
  public.join_requests,
  public.venue_monetization_settings
to service_role;

commit;
