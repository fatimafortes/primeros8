-- Migration 0008: the actual unannounced-firing mechanism
--
-- BEFORE RUNNING: enable the pg_cron extension in the Supabase
-- dashboard — Database -> Extensions -> search "pg_cron" -> Enable.
-- This can't be done from the SQL Editor as a normal migration
-- (pg_cron needs to be loaded via shared_preload_libraries, which is
-- project-level infrastructure only the dashboard toggle can do).
-- If pg_cron doesn't appear, or is greyed out / restricted on this
-- project's plan, stop here and tell me — the manual "Disparar ahora"
-- button (next commit, app code only) covers firing without it.
--
-- Touches: one new function, p8_fire_due_windows() (reads/writes
-- p8_drill_windows and p8_drill_events, both p8_), plus one
-- cron.schedule() call. cron.schedule is a function call (SELECT),
-- not DROP/TRUNCATE/ALTER/DELETE, so it doesn't fall under the
-- "nothing outside p8_" restriction the same way ALTER PUBLICATION
-- did for Realtime — flagging the reasoning so it's not just asserted.
--
-- SECURITY DEFINER, pinned search_path, same pattern as 0005/0006 —
-- but unlike those, EXECUTE is deliberately NOT granted to
-- authenticated. Nothing in the app ever calls this directly; only
-- the cron job (running as the role that scheduled it) should.

create or replace function p8_fire_due_windows()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  due_window record;
begin
  for due_window in
    select id, target_zone, target_shift, scenario_variant
    from p8_drill_windows
    where status = 'scheduled'
      and fire_at is not null
      and fire_at <= now()
      and ends_at >= now()
  loop
    insert into p8_drill_events (window_id, target_zone, target_shift, scenario_variant)
    values (
      due_window.id,
      due_window.target_zone,
      due_window.target_shift,
      coalesce(due_window.scenario_variant, 'Sismo 6.2 simulado')
    );

    update p8_drill_windows set status = 'fired' where id = due_window.id;
  end loop;
end;
$$;

revoke execute on function p8_fire_due_windows() from public;
revoke execute on function p8_fire_due_windows() from authenticated;

-- Every minute. cron.schedule upserts by job name on recent pg_cron
-- versions, so re-running this is safe; if your version errors on a
-- duplicate name, run select cron.unschedule('p8_fire_due_windows');
-- first.
select cron.schedule(
  'p8_fire_due_windows',
  '* * * * *',
  $$select p8_fire_due_windows();$$
);
