alter table public.explore_route_points
  add column if not exists image_overlay_opacity smallint not null default 8;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'explore_route_points_image_overlay_opacity_check'
      and conrelid = 'public.explore_route_points'::regclass
  ) then
    alter table public.explore_route_points
      add constraint explore_route_points_image_overlay_opacity_check
      check (image_overlay_opacity between 0 and 60);
  end if;
end
$$;

comment on column public.explore_route_points.image_overlay_opacity is
  'Opacity percentage of the warm editorial overlay applied to the main image.';
