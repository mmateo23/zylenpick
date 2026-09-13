begin;

-- Opening state is independent of publication and the usual weekly schedule.
alter table public.venues add column manual_open_status boolean;
comment on column public.venues.manual_open_status is
  'Merchant override: true=open, false=closed, null=use normal opening hours. Persists until changed.';

-- Recoverable bearer credentials for the internal panel. Never put these on venues
-- (which is publicly readable) or expose this schema through the Data API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
create table private.venue_manage_links (
  venue_id uuid primary key references public.venues(id) on delete cascade,
  token text not null unique check (token ~ '^[a-f0-9]{64}$'),
  regenerated_at timestamptz not null default now()
);
alter table private.venue_manage_links enable row level security;
revoke all on private.venue_manage_links from public, anon, authenticated;
grant select, insert, update, delete on private.venue_manage_links to service_role;

-- Invoker functions: only the trusted application server may call these RPCs.
create function public.admin_venue_manage_link(p_venue_id uuid, p_regenerate boolean default false)
returns text language plpgsql security invoker set search_path = '' as $$
declare link_token text;
begin
  insert into private.venue_manage_links (venue_id, token)
  values (p_venue_id, encode(extensions.gen_random_bytes(32), 'hex'))
  on conflict (venue_id) do update
    set token = case when p_regenerate then excluded.token else venue_manage_links.token end,
        regenerated_at = case when p_regenerate then now() else venue_manage_links.regenerated_at end
  returning token into link_token;
  return link_token;
end;
$$;

create function public.read_venue_management(p_token text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare managed_id uuid; result jsonb;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return null; end if;
  -- Rotation waits for in-flight operations; after it commits the old token
  -- cannot read or write, even from an already open browser tab.
  select venue_id into managed_id from private.venue_manage_links
    where token = p_token for share;
  if managed_id is null then return null; end if;
  select jsonb_build_object(
    'id', v.id, 'name', v.name, 'slug', v.slug,
    'citySlug', c.slug, 'cityName', c.name,
    'isPublished', v.is_active and v.is_published and coalesce(c.is_active, false),
    'pricesVisible', v.prices_visible, 'openingHours', v.opening_hours,
    'manualOpenStatus', v.manual_open_status,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'id', m.id, 'name', m.name, 'categoryName', m.category_name,
      'imageUrl', m.image_url, 'priceAmount', m.price_amount, 'currency', m.currency,
      'priceDisplayMode', m.price_display_mode, 'priceDisplayText', m.price_display_text,
      'isAvailable', m.is_available, 'isFeatured', m.is_featured
    ) order by m.sort_order, m.name, m.id) from public.menu_items m
      where m.venue_id = managed_id and m.capture_status = 'complete'), '[]'::jsonb)
  ) into result from public.venues v left join public.cities c on c.id = v.city_id
    where v.id = managed_id;
  return result;
end;
$$;

create function public.update_venue_management(p_token text, p_change jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare managed_id uuid; item_id uuid; kind text;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return null; end if;
  select venue_id into managed_id from private.venue_manage_links
    where token = p_token for share;
  if managed_id is null then return null; end if;
  if jsonb_typeof(p_change) is distinct from 'object' then
    raise exception 'Invalid change' using errcode = '22023';
  end if;
  kind := p_change->>'kind';
  if kind = 'opening' then
    if p_change - array['kind', 'value'] <> '{}'::jsonb
      or not (p_change ? 'value')
      or jsonb_typeof(p_change->'value') not in ('boolean', 'null') then
      raise exception 'Invalid opening state' using errcode = '22023';
    end if;
    update public.venues set manual_open_status = (p_change->>'value')::boolean where id = managed_id;
  elsif kind in ('availability', 'featured', 'price') then
    item_id := (p_change->>'itemId')::uuid;
    -- No venue id supplied by the caller is used. Also exclude unpublished captures.
    perform 1 from public.menu_items where id = item_id and venue_id = managed_id
      and capture_status = 'complete' for update;
    if not found then raise exception 'Item unavailable' using errcode = '22023'; end if;
    if kind in ('availability', 'featured') then
      if p_change - array['kind', 'itemId', 'value'] <> '{}'::jsonb
        or jsonb_typeof(p_change->'value') is distinct from 'boolean' then
        raise exception 'Invalid item state' using errcode = '22023';
      end if;
      if kind = 'availability' then
        update public.menu_items set is_available = (p_change->>'value')::boolean
          where id = item_id and venue_id = managed_id;
      else
        update public.menu_items set is_featured = (p_change->>'value')::boolean
          where id = item_id and venue_id = managed_id;
      end if;
    else
      if p_change - array['kind','itemId','mode','amount','text'] <> '{}'::jsonb
        or coalesce(p_change->>'mode', '') not in ('fixed','from','variable','hidden')
        or (p_change ? 'text' and jsonb_typeof(p_change->'text') not in ('string','null'))
        or length(coalesce(p_change->>'text', '')) > 80 then
        raise exception 'Invalid price mode' using errcode = '22023';
      end if;
      if p_change->>'mode' in ('fixed','from') and (
        jsonb_typeof(p_change->'amount') is distinct from 'number'
        or (p_change->>'amount') !~ '^[0-9]+$'
        or (p_change->>'amount')::numeric > 2147483647
      ) then raise exception 'Invalid price amount' using errcode = '22023'; end if;
      update public.menu_items set
        price_display_mode = p_change->>'mode',
        -- A non-numeric mode never resets an existing numeric price to zero.
        price_amount = case when p_change->>'mode' in ('fixed','from')
          then (p_change->>'amount')::integer else price_amount end,
        price_display_text = nullif(btrim(p_change->>'text'), '')
      where id = item_id and venue_id = managed_id;
    end if;
  else
    raise exception 'Invalid operation' using errcode = '22023';
  end if;
  return public.read_venue_management(p_token);
end;
$$;

revoke all on function public.admin_venue_manage_link(uuid, boolean) from public, anon, authenticated;
revoke all on function public.read_venue_management(text) from public, anon, authenticated;
revoke all on function public.update_venue_management(text, jsonb) from public, anon, authenticated;
grant execute on function public.admin_venue_manage_link(uuid, boolean) to service_role;
grant execute on function public.read_venue_management(text) to service_role;
grant execute on function public.update_venue_management(text, jsonb) to service_role;
commit;
