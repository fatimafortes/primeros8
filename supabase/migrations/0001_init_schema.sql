-- Migration 0001: PRIMEROS 8 core schema
-- Additive only. Creates seven new tables, all prefixed p8_.
-- No DROP / TRUNCATE / ALTER / DELETE anywhere in this file.
-- No existing table in the project is modified.
-- The only reference to something outside p8_ is a foreign key from
-- p8_profiles.id to auth.users(id) — that's Supabase's own auth schema,
-- required so RLS can check auth.uid() against a profile. It does not
-- alter, insert into, or delete from auth.users.

create table p8_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Mexico_City',
  created_at timestamptz not null default now()
);

create table p8_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'worker')),
  site_id uuid references p8_sites (id),
  zone text check (zone in ('Zona A', 'Zona B', 'Zona C')),
  shift text check (shift in ('Matutino', 'Vespertino', 'Nocturno')),
  created_at timestamptz not null default now()
);

create table p8_enrollments (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null unique references p8_profiles (id) on delete cascade,
  consent_given_at timestamptz not null default now(),
  trauma_precheck text not null check (trauma_precheck in ('yes', 'no', 'prefer_not_to_say')),
  opted_out_of_immersion boolean not null default false,
  created_at timestamptz not null default now()
);

create table p8_drill_windows (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references p8_sites (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'fired', 'completed', 'cancelled')),
  created_by uuid references p8_profiles (id),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table p8_drill_events (
  id uuid primary key default gen_random_uuid(),
  window_id uuid not null references p8_drill_windows (id) on delete cascade,
  fired_at timestamptz not null default now(),
  scenario_variant text not null,
  target_zone text check (target_zone in ('Zona A', 'Zona B', 'Zona C')),
  target_shift text check (target_shift in ('Matutino', 'Vespertino', 'Nocturno')),
  created_at timestamptz not null default now()
);

create table p8_responses (
  id uuid primary key default gen_random_uuid(),
  drill_event_id uuid not null references p8_drill_events (id) on delete cascade,
  worker_id uuid not null references p8_profiles (id) on delete cascade,
  immersion_path text not null check (immersion_path in ('immersive', 'non_immersive')),
  protective_action_at timestamptz,
  time_to_protective_action_ms integer check (time_to_protective_action_ms >= 0),
  exited_early boolean not null default false,
  geo_checkin_at timestamptz,
  time_to_assembly_ms integer check (time_to_assembly_ms >= 0),
  location_zone_estimate text check (location_zone_estimate in ('Zona A', 'Zona B', 'Zona C')),
  location_verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (drill_event_id, worker_id)
);

create table p8_scheduler_proposals (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references p8_sites (id) on delete cascade,
  proposed_starts_at timestamptz not null,
  proposed_ends_at timestamptz not null,
  proposed_variant text not null,
  target_zone text check (target_zone in ('Zona A', 'Zona B', 'Zona C')),
  target_shift text check (target_shift in ('Matutino', 'Vespertino', 'Nocturno')),
  rationale text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'edited', 'dismissed')),
  created_at timestamptz not null default now(),
  check (proposed_ends_at > proposed_starts_at)
);

-- Indexes for the lookups features 3, 7 and 8 will run. No existing
-- index touched; these are all new, on new tables.
create index p8_profiles_site_id_idx on p8_profiles (site_id);
create index p8_drill_windows_site_id_idx on p8_drill_windows (site_id);
create index p8_drill_events_window_id_idx on p8_drill_events (window_id);
create index p8_responses_drill_event_id_idx on p8_responses (drill_event_id);
create index p8_responses_worker_id_idx on p8_responses (worker_id);
create index p8_scheduler_proposals_site_id_idx on p8_scheduler_proposals (site_id);
