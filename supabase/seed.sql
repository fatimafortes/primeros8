-- Feature 2 seed data. INSERT only, into p8_ tables only:
-- p8_sites, p8_profiles, p8_drill_windows, p8_drill_events,
-- p8_enrollments, p8_responses.
--
-- Requires migration 0003 to have run first (invented workers use
-- id = gen_random_uuid(), which only works once p8_profiles.id no
-- longer requires a real auth.users row).
--
-- Your real auth.users.id is filled in below (from /account).

-- p8_sites: one invented site.
insert into p8_sites (id, name, timezone) values
  ('a0000000-0000-4000-8000-000000000001', 'Planta Norte — ficticia', 'America/Mexico_City');

-- p8_profiles: your admin row, linked to the seeded site.
insert into p8_profiles (id, role, site_id) values
  ('a83f58b2-f3cf-4b05-9113-1e4b5082172e', 'admin', 'a0000000-0000-4000-8000-000000000001');

-- p8_drill_windows: one completed window, 2026-09-10, 10:00-14:00.
insert into p8_drill_windows (id, site_id, starts_at, ends_at, status, created_by) values
  (
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    '2026-09-10 10:00:00-06',
    '2026-09-10 14:00:00-06',
    'completed',
    'a83f58b2-f3cf-4b05-9113-1e4b5082172e'
  );

-- p8_drill_events: one per zone, both fired inside the window above.
insert into p8_drill_events (id, window_id, fired_at, scenario_variant, target_zone, target_shift) values
  (
    'a0000000-0000-4000-8000-0000000000a1',
    'a0000000-0000-4000-8000-000000000002',
    '2026-09-10 11:47:00-06',
    'Sismo 6.2 simulado — bodega ficticia',
    'Zona A',
    'Matutino'
  ),
  (
    'a0000000-0000-4000-8000-0000000000b1',
    'a0000000-0000-4000-8000-000000000002',
    '2026-09-10 12:13:00-06',
    'Sismo 6.2 simulado — línea ficticia',
    'Zona B',
    'Matutino'
  );

-- p8_profiles: 3 invented Zona A workers + 5 invented Zona B workers.
-- Below the floor in A (3), crosses it in B (5).
insert into p8_profiles (id, role, site_id, zone, shift) values
  ('a0000000-0000-4000-8000-0000000a0001', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona A', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000a0002', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona A', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000a0003', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona A', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000b0001', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona B', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000b0002', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona B', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000b0003', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona B', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000b0004', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona B', 'Matutino'),
  ('a0000000-0000-4000-8000-0000000b0005', 'worker', 'a0000000-0000-4000-8000-000000000001', 'Zona B', 'Matutino');

-- p8_enrollments: one per invented worker. wB0003 opted out of
-- immersion after a "yes" on the trauma pre-check — the seeded example
-- of the non-immersive path.
insert into p8_enrollments (worker_id, trauma_precheck, opted_out_of_immersion) values
  ('a0000000-0000-4000-8000-0000000a0001', 'no', false),
  ('a0000000-0000-4000-8000-0000000a0002', 'prefer_not_to_say', false),
  ('a0000000-0000-4000-8000-0000000a0003', 'no', false),
  ('a0000000-0000-4000-8000-0000000b0001', 'no', false),
  ('a0000000-0000-4000-8000-0000000b0002', 'no', false),
  ('a0000000-0000-4000-8000-0000000b0003', 'yes', true),
  ('a0000000-0000-4000-8000-0000000b0004', 'no', false),
  ('a0000000-0000-4000-8000-0000000b0005', 'prefer_not_to_say', false);

-- p8_responses: one per invented worker, against their zone's event.
-- Zona A: 3 rows, avg ~4.6s protective / ~98s assembly.
-- Zona B: 5 rows, avg ~6.8s protective / ~135s assembly.
insert into p8_responses (
  drill_event_id, worker_id, immersion_path, protective_action_at,
  time_to_protective_action_ms, geo_checkin_at, time_to_assembly_ms,
  location_zone_estimate, location_verified
) values
  ('a0000000-0000-4000-8000-0000000000a1', 'a0000000-0000-4000-8000-0000000a0001', 'immersive',
   '2026-09-10 11:47:04.200-06', 4200, '2026-09-10 11:48:39.200-06', 95000, 'Zona A', true),
  ('a0000000-0000-4000-8000-0000000000a1', 'a0000000-0000-4000-8000-0000000a0002', 'immersive',
   '2026-09-10 11:47:05.600-06', 5600, '2026-09-10 11:48:55.600-06', 110000, 'Zona A', true),
  ('a0000000-0000-4000-8000-0000000000a1', 'a0000000-0000-4000-8000-0000000a0003', 'immersive',
   '2026-09-10 11:47:03.900-06', 3900, '2026-09-10 11:48:31.900-06', 88000, 'Zona A', false),

  ('a0000000-0000-4000-8000-0000000000b1', 'a0000000-0000-4000-8000-0000000b0001', 'immersive',
   '2026-09-10 12:13:06.100-06', 6100, '2026-09-10 12:15:16.100-06', 130000, 'Zona B', true),
  ('a0000000-0000-4000-8000-0000000000b1', 'a0000000-0000-4000-8000-0000000b0002', 'immersive',
   '2026-09-10 12:13:07.300-06', 7300, '2026-09-10 12:15:29.300-06', 142000, 'Zona B', true),
  ('a0000000-0000-4000-8000-0000000000b1', 'a0000000-0000-4000-8000-0000000b0003', 'non_immersive',
   '2026-09-10 12:13:05.000-06', 5000, '2026-09-10 12:15:06.000-06', 121000, 'Zona B', true),
  ('a0000000-0000-4000-8000-0000000000b1', 'a0000000-0000-4000-8000-0000000b0004', 'immersive',
   '2026-09-10 12:13:08.800-06', 8800, '2026-09-10 12:15:43.800-06', 155000, 'Zona B', true),
  ('a0000000-0000-4000-8000-0000000000b1', 'a0000000-0000-4000-8000-0000000b0005', 'immersive',
   '2026-09-10 12:13:06.700-06', 6700, '2026-09-10 12:15:14.700-06', 128000, 'Zona B', false);
