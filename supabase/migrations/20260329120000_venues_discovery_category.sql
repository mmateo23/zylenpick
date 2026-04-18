alter table public.venues
add column if not exists discovery_category text;

update public.venues
set discovery_category = case slug
  when 'la-comida-de-los-dados' then 'Comida casera'
  when 'bendita-burger' then 'Burgers'
  when 'burger-mc-queens' then 'Burgers'
  when 'godzilla-smash-burger' then 'Burgers'
  when 'manhattan-burger' then 'Burgers'
  when 'pizzeria-carlos-talavera' then 'Pizza'
  when 'sushi-talavera' then 'Sushi'
  else discovery_category
end
where discovery_category is null;
