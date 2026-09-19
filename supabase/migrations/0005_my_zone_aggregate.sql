-- Migration 0005: p8_my_zone_aggregate() — a worker's own zone/shift
-- average, count-gated at 5, no raw rows exposed.
-- Touches: one new function only, reading p8_profiles and
-- p8_responses (both p8_ tables) internally. SECURITY DEFINER with a
-- pinned search_path — same pattern agreed for feature 7's admin
-- aggregate, needed here because a worker's own RLS (self-only on
-- p8_responses) can't see other workers' rows to average them either.
--
-- Why now, not feature 7: the debrief screen (feature 6) shows "your
-- zone's average" next to your own result. That's a different query
-- shape than feature 7's admin dashboard (all zones/shifts at a
-- site) — this one always resolves from the caller's own profile, no
-- parameters, so there's no way to probe another zone by passing a
-- different argument.

create or replace function p8_my_zone_aggregate()
returns table (
  response_count bigint,
  avg_protective_action_ms numeric,
  avg_assembly_ms numeric
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with me as (
    select site_id, zone, shift
    from p8_profiles
    where id = auth.uid()
  ),
  zone_responses as (
    select r.time_to_protective_action_ms, r.time_to_assembly_ms
    from me
    join p8_profiles p
      on p.site_id is not distinct from me.site_id
     and p.zone is not distinct from me.zone
     and p.shift is not distinct from me.shift
    join p8_responses r on r.worker_id = p.id
    where r.time_to_protective_action_ms is not null
  )
  select
    count(*) as response_count,
    case when count(*) >= 5 then avg(time_to_protective_action_ms) end,
    case when count(*) >= 5 then avg(time_to_assembly_ms) end
  from zone_responses;
$$;

grant execute on function p8_my_zone_aggregate() to authenticated;
revoke execute on function p8_my_zone_aggregate() from public;
