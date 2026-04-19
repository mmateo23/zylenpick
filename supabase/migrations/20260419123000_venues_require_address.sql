alter table public.venues
drop constraint if exists venues_address_required_check;

alter table public.venues
add constraint venues_address_required_check
check (address is not null and btrim(address) <> '')
not valid;
