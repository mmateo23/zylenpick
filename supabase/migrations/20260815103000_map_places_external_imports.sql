-- Trace imported map places back to their external source and prevent duplicates.

begin;

alter table public.map_places
  add column if not exists external_id text,
  add column if not exists external_data jsonb not null default '{}'::jsonb,
  add column if not exists source_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'map_places_source_external_id_key'
      and conrelid = 'public.map_places'::regclass
  ) then
    alter table public.map_places
      add constraint map_places_source_external_id_key unique (source, external_id);
  end if;
end
$$;

alter table public.map_places
  drop constraint if exists map_places_external_id_length_check;

alter table public.map_places
  add constraint map_places_external_id_length_check check (
    external_id is null or char_length(external_id) between 1 and 160
  );

commit;
