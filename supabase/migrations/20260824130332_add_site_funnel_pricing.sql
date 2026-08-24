alter table public.site_funnel_settings
  drop constraint if exists site_funnel_settings_key_check;

alter table public.site_funnel_settings
  add constraint site_funnel_settings_key_check
  check (key in ('platos', 'pricing'));

insert into public.site_funnel_settings (key, value)
values (
  'pricing',
  '{
    "basic": {
      "enabled": false,
      "originalPriceCents": 900,
      "discountedPriceCents": 900,
      "label": "",
      "expiresAt": "",
      "stripeCouponId": "",
      "stripePromotionCodeId": "",
      "stripeSyncStatus": "sin_vincular"
    },
    "oro": {
      "enabled": false,
      "originalPriceCents": 1900,
      "discountedPriceCents": 1900,
      "label": "",
      "expiresAt": "",
      "stripeCouponId": "",
      "stripePromotionCodeId": "",
      "stripeSyncStatus": "sin_vincular"
    },
    "titanio": {
      "enabled": false,
      "originalPriceCents": 3900,
      "discountedPriceCents": 3900,
      "label": "",
      "expiresAt": "",
      "stripeCouponId": "",
      "stripePromotionCodeId": "",
      "stripeSyncStatus": "sin_vincular"
    },
    "professional_onboarding": {
      "enabled": false,
      "originalPriceCents": 9900,
      "discountedPriceCents": 9900,
      "label": "",
      "expiresAt": "",
      "stripeCouponId": "",
      "stripePromotionCodeId": "",
      "stripeSyncStatus": "sin_vincular"
    }
  }'::jsonb
)
on conflict (key) do nothing;
