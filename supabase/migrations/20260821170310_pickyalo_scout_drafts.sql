begin;

alter table public.map_places
  alter column slug drop not null,
  alter column name drop not null,
  alter column category drop not null,
  alter column icon_name drop not null,
  alter column latitude drop not null,
  alter column longitude drop not null;

alter table public.map_places
  add column if not exists captured_by uuid references auth.users(id) on delete set null,
  add column if not exists capture_method text not null default 'admin',
  add column if not exists access_type text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'map_places_capture_method_check'
      and conrelid = 'public.map_places'::regclass
  ) then
    alter table public.map_places
      add constraint map_places_capture_method_check
      check (capture_method in ('admin', 'scout'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'map_places_access_type_check'
      and conrelid = 'public.map_places'::regclass
  ) then
    alter table public.map_places
      add constraint map_places_access_type_check
      check (access_type is null or access_type in ('free', 'restricted', 'unknown'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'map_places_published_required_fields_check'
      and conrelid = 'public.map_places'::regclass
  ) then
    alter table public.map_places
      add constraint map_places_published_required_fields_check
      check (
        status <> 'published'
        or (
          name is not null and btrim(name) <> ''
          and slug is not null and btrim(slug) <> ''
          and category is not null
          and icon_name is not null and btrim(icon_name) <> ''
          and latitude is not null
          and longitude is not null
        )
      );
  end if;
end
$$;

create index if not exists idx_map_places_scout_pending
  on public.map_places (created_at desc)
  where capture_method = 'scout' and status = 'draft';

create index if not exists idx_map_places_captured_by
  on public.map_places (captured_by)
  where captured_by is not null;

comment on column public.map_places.capture_method is
  'Origin of the record. Scout captures are always created as non-public drafts.';
comment on column public.map_places.captured_by is
  'Authenticated admin user who created the field capture, when available.';
comment on column public.map_places.access_type is
  'Known access at capture time: free, restricted or unknown.';

commit;
