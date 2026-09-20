-- Migration 0007: fire-moment + targeting columns on p8_drill_windows
-- Touches exactly one table: p8_drill_windows. Four new nullable
-- columns, additive, ALTER on our own p8_ table (same as enabling RLS
-- in 0002 — not against a non-p8_ object, so within the stated rules).
--
-- fire_at: the random moment inside [starts_at, ends_at] the window
-- will actually fire, computed server-side by the app at window-
-- creation time. Never selected by any query whose result reaches a
-- client component, and no RLS policy grants a worker SELECT on this
-- table at all — so it is not discoverable ahead of time by anyone,
-- including the admin's own browser.
--
-- target_zone / target_shift: carried from an accepted scheduler
-- proposal into the window that gets created from it, so a targeted
-- proposal actually stays targeted when it fires (previously lost at
-- accept time — caught while building this). Null means "every
-- eligible worker at the site," same convention as p8_drill_events.
--
-- scenario_variant: which invented scenario name the resulting
-- p8_drill_event gets. Null falls back to a default in the firing
-- function, so existing rows (Feature 3's original simple form, seed
-- data windows) don't need backfilling.

alter table p8_drill_windows
  add column fire_at timestamptz,
  add column target_zone text check (target_zone in ('Zona A', 'Zona B', 'Zona C')),
  add column target_shift text check (target_shift in ('Matutino', 'Vespertino', 'Nocturno')),
  add column scenario_variant text;
