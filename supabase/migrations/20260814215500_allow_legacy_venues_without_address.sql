-- Legacy catalogue rows may not have a confirmed street address yet.
-- Keep rejecting blank strings while allowing NULL until those records are
-- reviewed from the admin panel. The admin form still requires an address for
-- every new venue.
alter table public.venues
drop constraint if exists venues_address_required_check;

alter table public.venues
add constraint venues_address_required_check
check (address is null or btrim(address) <> '')
not valid;
