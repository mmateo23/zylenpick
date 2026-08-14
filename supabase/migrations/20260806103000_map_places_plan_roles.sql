-- Curated roles used by the lightweight Plan Pickyalo experience.
-- Places remain excluded from plans until an editor explicitly enables them.

begin;

alter table public.map_places
  add column if not exists plan_role text not null default 'support';

alter table public.map_places
  add column if not exists is_plan_candidate boolean not null default false;

alter table public.map_places
  drop constraint if exists map_places_plan_role_check;

alter table public.map_places
  add constraint map_places_plan_role_check
  check (plan_role in ('discover', 'enjoy', 'support'));

create index if not exists map_places_plan_candidates_idx
  on public.map_places (city_id, is_plan_candidate, plan_role, status, is_active);

commit;
