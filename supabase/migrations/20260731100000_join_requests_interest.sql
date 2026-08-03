begin;

alter table public.join_requests
  add column if not exists interest text;

alter table public.join_requests
  drop constraint if exists join_requests_interest_check;

alter table public.join_requests
  add constraint join_requests_interest_check
  check (
    interest is null
    or interest in (
      'free_presence',
      'improve_presence',
      'more_visibility',
      'guided_growth'
    )
  );

create index if not exists join_requests_interest_idx
  on public.join_requests (interest)
  where interest is not null;

comment on column public.join_requests.interest is
  'Public commercial outcome selected in the join form. It does not assign an internal monetization plan.';

commit;
