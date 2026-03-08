create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'merchant')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.venue_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  membership_role text not null default 'owner' check (membership_role in ('owner', 'manager', 'editor')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, venue_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = excluded.role,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists venue_memberships_set_updated_at on public.venue_memberships;
create trigger venue_memberships_set_updated_at
before update on public.venue_memberships
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.venue_memberships enable row level security;
alter table public.venues enable row level security;
alter table public.menu_items enable row level security;
alter table public.posts enable row level security;

drop policy if exists "Public can read active venues" on public.venues;
create policy "Public can read active venues"
on public.venues
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Members can update owned venues" on public.venues;
create policy "Members can update owned venues"
on public.venues
for update
to authenticated
using (
  exists (
    select 1
    from public.venue_memberships
    where public.venue_memberships.venue_id = public.venues.id
      and public.venue_memberships.profile_id = auth.uid()
      and public.venue_memberships.membership_role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.venue_memberships
    where public.venue_memberships.venue_id = public.venues.id
      and public.venue_memberships.profile_id = auth.uid()
      and public.venue_memberships.membership_role in ('owner', 'manager')
  )
);

drop policy if exists "Public can read available menu items" on public.menu_items;
create policy "Public can read available menu items"
on public.menu_items
for select
to anon, authenticated
using (is_available = true);

drop policy if exists "Members can manage owned menu items" on public.menu_items;
create policy "Members can manage owned menu items"
on public.menu_items
for all
to authenticated
using (
  exists (
    select 1
    from public.venue_memberships
    where public.venue_memberships.venue_id = public.menu_items.venue_id
      and public.venue_memberships.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.venue_memberships
    where public.venue_memberships.venue_id = public.menu_items.venue_id
      and public.venue_memberships.profile_id = auth.uid()
  )
);

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Members can manage owned posts" on public.posts;
create policy "Members can manage owned posts"
on public.posts
for all
to authenticated
using (
  exists (
    select 1
    from public.venue_memberships
    where public.venue_memberships.venue_id = public.posts.venue_id
      and public.venue_memberships.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.venue_memberships
    where public.venue_memberships.venue_id = public.posts.venue_id
      and public.venue_memberships.profile_id = auth.uid()
  )
);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can read their own memberships" on public.venue_memberships;
create policy "Users can read their own memberships"
on public.venue_memberships
for select
to authenticated
using (profile_id = auth.uid());
