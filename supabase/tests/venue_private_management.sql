-- Run against a database with the migration applied. All fixtures roll back.
begin;
do $$
declare
  venue_a uuid := gen_random_uuid(); venue_b uuid := gen_random_uuid();
  item_a uuid := gen_random_uuid(); item_b uuid := gen_random_uuid(); draft_id uuid := gen_random_uuid();
  token_a text; token_b text; rotated text; snapshot jsonb; rejected boolean;
begin
  insert into public.venues(id,slug,name,address,is_active,is_published)
    values (venue_a,'manage-test-'||venue_a,'Comercio de prueba A','Dirección de prueba',false,false),
           (venue_b,'manage-test-'||venue_b,'Comercio de prueba B','Dirección de prueba',false,false);
  insert into public.menu_items(id,venue_id,name,price_amount,capture_status) values
    (item_a,venue_a,'Producto A',950,'complete'), (item_b,venue_b,'Producto B',1250,'complete'),
    (draft_id,venue_a,'Captura pendiente',0,'pending');

  token_a := public.admin_venue_manage_link(venue_a);
  token_b := public.admin_venue_manage_link(venue_b);
  assert length(token_a) = 64 and token_a <> token_b, 'Strong independent tokens';
  assert public.admin_venue_manage_link(venue_a) = token_a, 'Viewing a link must not rotate it';
  assert public.read_venue_management(repeat('0',64)) is null, 'Unknown token';
  assert public.read_venue_management('bad-token') is null, 'Malformed token';
  snapshot := public.read_venue_management(token_a);
  assert snapshot->>'id' = venue_a::text and jsonb_array_length(snapshot->'items') = 1, 'Scope reads and exclude captures';
  assert not snapshot ? 'token' and not snapshot ? 'email', 'Minimize returned data';

  rejected := false;
  begin perform public.update_venue_management(token_a,jsonb_build_object('kind','availability','itemId',item_b,'value',false));
  exception when sqlstate '22023' then rejected := true; end;
  assert rejected, 'Cross-venue write must fail';
  rejected := false;
  begin perform public.update_venue_management(token_a,jsonb_build_object('kind','availability','itemId',draft_id,'value',true));
  exception when sqlstate '22023' then rejected := true; end;
  assert rejected, 'Unprepared captures cannot be published';
  rejected := false;
  begin perform public.update_venue_management(token_a,jsonb_build_object('kind','opening','value',true,'venueId',venue_b));
  exception when sqlstate '22023' then rejected := true; end;
  assert rejected, 'Reject unknown fields';

  perform public.update_venue_management(token_a,'{"kind":"opening","value":true}'::jsonb);
  assert (select manual_open_status from public.venues where id=venue_a), 'Open';
  perform public.update_venue_management(token_a,'{"kind":"opening","value":false}'::jsonb);
  assert not (select manual_open_status from public.venues where id=venue_a), 'Close';
  perform public.update_venue_management(token_a,'{"kind":"opening","value":null}'::jsonb);
  assert (select manual_open_status is null from public.venues where id=venue_a), 'Restore schedule';
  assert (select not is_active and not is_published from public.venues where id=venue_a), 'Do not change publication';
  perform public.update_venue_management(token_a,jsonb_build_object('kind','availability','itemId',item_a,'value',false));
  perform public.update_venue_management(token_a,jsonb_build_object('kind','featured','itemId',item_a,'value',true));
  assert (select not is_available and is_featured from public.menu_items where id=item_a), 'Availability and featured';

  perform public.update_venue_management(token_a,jsonb_build_object('kind','price','itemId',item_a,'mode','fixed','amount',1234,'text',null));
  assert (select price_amount=1234 and price_display_mode='fixed' from public.menu_items where id=item_a), 'Fixed cents';
  perform public.update_venue_management(token_a,jsonb_build_object('kind','price','itemId',item_a,'mode','from','amount',1500,'text',null));
  assert (select price_amount=1500 and price_display_mode='from' from public.menu_items where id=item_a), 'From price';
  perform public.update_venue_management(token_a,jsonb_build_object('kind','price','itemId',item_a,'mode','variable','text','Según peso'));
  assert (select price_amount=1500 and price_display_mode='variable' and price_display_text='Según peso' from public.menu_items where id=item_a), 'Variable retains amount';
  perform public.update_venue_management(token_a,jsonb_build_object('kind','price','itemId',item_a,'mode','hidden','text',null));
  assert (select price_amount=1500 and price_display_mode='hidden' from public.menu_items where id=item_a), 'Hidden retains amount';
  rejected := false;
  begin perform public.update_venue_management(token_a,jsonb_build_object('kind','price','itemId',item_a,'mode','fixed','amount',-1));
  exception when sqlstate '22023' then rejected := true; end;
  assert rejected, 'Reject invalid amounts';
  rejected := false;
  begin perform public.update_venue_management(token_a,jsonb_build_object('kind','price','itemId',item_a,'mode','fixed'));
  exception when sqlstate '22023' then rejected := true; end;
  assert rejected, 'Numeric modes require amounts';

  rotated := public.admin_venue_manage_link(venue_a,true);
  assert rotated <> token_a, 'Rotation replaces token';
  assert public.read_venue_management(token_a) is null, 'Old token cannot read';
  assert public.update_venue_management(token_a,'{"kind":"opening","value":true}') is null, 'Old token cannot write';
  assert public.read_venue_management(rotated)->>'id' = venue_a::text, 'New token works';
  assert public.read_venue_management(token_b)->>'id' = venue_b::text, 'Other token unaffected';
  assert (select price_amount=1250 and is_available from public.menu_items where id=item_b), 'Other venue unchanged';

  assert not has_schema_privilege('anon','private','USAGE'), 'No anon schema access';
  assert not has_table_privilege('authenticated','private.venue_manage_links','SELECT'), 'No authenticated token reads';
  assert not has_function_privilege('anon','public.read_venue_management(text)','EXECUTE'), 'No anon RPC access';
  assert not has_function_privilege('authenticated','public.update_venue_management(text,jsonb)','EXECUTE'), 'No authenticated RPC access';
  assert not has_function_privilege('anon','public.admin_venue_manage_link(uuid,boolean)','EXECUTE'), 'No public rotation';
  assert has_function_privilege('service_role','public.update_venue_management(text,jsonb)','EXECUTE'), 'Server-only access';
end;
$$;
select 'PASS: tokens, rotation, tenant isolation, price modes, publication and privileges' as result;
rollback;
