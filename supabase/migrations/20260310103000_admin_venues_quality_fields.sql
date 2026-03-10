-- Campos editoriales y operativos para locales del MVP.

alter table public.venues
  add column if not exists phone text,
  add column if not exists opening_hours jsonb,
  add column if not exists is_verified boolean not null default false,
  add column if not exists subscription_active boolean not null default false,
  add column if not exists is_published boolean not null default true,
  add column if not exists sort_order integer;
