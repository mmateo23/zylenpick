create table if not exists public.site_chips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  type text not null default 'editorial'
    constraint site_chips_type_check check (type in ('editorial', 'promocional', 'temporal')),
  item_ids uuid[] not null default '{}'::uuid[],
  starts_at timestamptz null,
  ends_at timestamptz null,
  weekdays integer[] not null default '{}'::integer[]
    constraint site_chips_weekdays_check check (
      weekdays <@ array[1, 2, 3, 4, 5, 6, 7]
    ),
  start_time time null,
  end_time time null,
  is_paid boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_chips_active_sort_idx
on public.site_chips (is_active, sort_order, name);

create index if not exists site_chips_item_ids_gin_idx
on public.site_chips using gin (item_ids);

drop trigger if exists site_chips_set_updated_at on public.site_chips;
create trigger site_chips_set_updated_at
before update on public.site_chips
for each row
execute function public.set_updated_at();

alter table public.site_chips enable row level security;

drop policy if exists "Site chips are viewable by everyone" on public.site_chips;
create policy "Site chips are viewable by everyone"
on public.site_chips
for select
using (true);
