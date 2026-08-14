begin;

alter table public.menu_items
  add column if not exists price_display_mode text not null default 'fixed',
  add column if not exists price_display_text text;

alter table public.menu_items
  drop constraint if exists menu_items_price_display_mode_check;

alter table public.menu_items
  add constraint menu_items_price_display_mode_check
  check (price_display_mode in ('fixed', 'from', 'variable', 'hidden'));

alter table public.menu_items
  drop constraint if exists menu_items_price_display_text_length_check;

alter table public.menu_items
  add constraint menu_items_price_display_text_length_check
  check (
    price_display_text is null
    or char_length(btrim(price_display_text)) between 1 and 80
  );

comment on column public.menu_items.price_display_mode is
  'Controls public price presentation. Existing products default to fixed.';

comment on column public.menu_items.price_display_text is
  'Optional merchant-facing label for variable prices, for example price by weight.';

grant insert (price_display_mode, price_display_text)
  on public.menu_items to authenticated;
grant update (price_display_mode, price_display_text)
  on public.menu_items to authenticated;

commit;
