alter table public.venues
add column if not exists latitude double precision,
add column if not exists longitude double precision;

alter table public.venues
drop constraint if exists venues_latitude_range_check;

alter table public.venues
add constraint venues_latitude_range_check
check (latitude is null or (latitude >= -90 and latitude <= 90))
not valid;

alter table public.venues
drop constraint if exists venues_longitude_range_check;

alter table public.venues
add constraint venues_longitude_range_check
check (longitude is null or (longitude >= -180 and longitude <= 180))
not valid;
