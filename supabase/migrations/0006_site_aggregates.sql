-- Migration 0006: p8_site_aggregates() — one row per zone/shift at the
-- admin's own site, count-gated at 5, no raw rows exposed.
-- Touches: one new function only, reading p8_profiles and
-- p8_responses (both p8_) internally. SECURITY DEFINER, pinned
-- search_path — same pattern as 0005's p8_my_zone_aggregate(), but
-- resolves the caller's SITE (admin) instead of the caller's own
-- zone (worker), and returns every zone/shift combination at that
-- site instead of just one.
--
-- Gated by role, not just by being SECURITY DEFINER: the first CTE
-- only matches rows where the caller's own profile has role = 'admin'.
-- A worker calling this function gets zero rows back, not another
-- worker's zone — the function bypasses RLS internally to compute the
-- aggregate, but it never trusts the caller's claimed role from
-- anywhere except their own p8_profiles row.

create or replace function p8_site_aggregates()
returns table (
  zone text,
  shift text,
  response_count bigint,
  avg_protective_action_ms numeric,
  avg_assembly_ms numeric
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with my_site as (
    select site_id
    from p8_profiles
    where id = auth.uid() and role = 'admin'
  ),
  zone_responses as (
    select p.zone, p.shift, r.time_to_protective_action_ms, r.time_to_assembly_ms
    from my_site
    join p8_profiles p on p.site_id = my_site.site_id and p.role = 'worker'
    join p8_responses r on r.worker_id = p.id
    where r.time_to_protective_action_ms is not null
  )
  select
    zone,
    shift,
    count(*) as response_count,
    case when count(*) >= 5 then avg(time_to_protective_action_ms) end,
    case when count(*) >= 5 then avg(time_to_assembly_ms) end
  from zone_responses
  group by zone, shift
  order by zone, shift;
$$;

grant execute on function p8_site_aggregates() to authenticated;
revoke execute on function p8_site_aggregates() from public;
