begin;

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
      'guided_growth',
      'commercial_consultation'
    )
  );

comment on column public.join_requests.interest is
  'Public commercial outcome selected in the join form. It does not assign an internal monetization plan.';

commit;
