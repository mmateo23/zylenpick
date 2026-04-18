alter table public.venues
add column if not exists subscription_tier text not null default 'basic';

alter table public.venues
drop constraint if exists venues_subscription_tier_check;

alter table public.venues
add constraint venues_subscription_tier_check
check (subscription_tier in ('basic', 'oro', 'titanio'));
