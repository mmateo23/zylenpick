-- Coordinates checked against each venue's published street address.
-- Only fill missing values so later corrections from the admin panel win.
update public.venues
set
  latitude = 39.9594723,
  longitude = -4.8367632
where lower(slug) = 'la-comida-de-los-dados'
  and (latitude is null or longitude is null);

update public.venues
set
  latitude = 39.9594252,
  longitude = -4.8315650
where lower(slug) = 'casco-viejo-bar-kitchen'
  and (latitude is null or longitude is null);

update public.venues
set
  latitude = 39.9586912,
  longitude = -4.8327514
where lower(slug) = 'taberna-plaza-mayor'
  and (latitude is null or longitude is null);
