alter table public.venues
  add column if not exists qr_hero_tagline text,
  add column if not exists qr_story text,
  add column if not exists qr_story_image_urls text[] not null default '{}'::text[];

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'venues_qr_story_image_urls_limit_check'
      and conrelid = 'public.venues'::regclass
  ) then
    alter table public.venues
      add constraint venues_qr_story_image_urls_limit_check
      check (cardinality(qr_story_image_urls) <= 3);
  end if;
end
$$;

comment on column public.venues.qr_hero_tagline is
  'Short venue-led headline shown over the QR hero image.';
comment on column public.venues.qr_story is
  'Long-form venue story opened from the QR experience.';
comment on column public.venues.qr_story_image_urls is
  'Up to three images used in the QR venue story.';
