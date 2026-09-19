-- Migration 0002: RLS policies for the seven p8_ tables
-- Additive only. No DROP / TRUNCATE / DELETE anywhere in this file.
-- The only ALTER statements enable RLS on our own p8_ tables — the
-- no-ALTER rule is about objects outside p8_, not about these.
--
-- Explicit and load-bearing: p8_enrollments gets NO policy that
-- mentions role = 'admin', for any command, scoped or not. That
-- absence is what keeps the trauma pre-check out of admin's reach —
-- enforced by never writing the grant, not by a "deny" rule someone
-- could edit around later without noticing why it was there.

alter table p8_sites enable row level security;
alter table p8_profiles enable row level security;
alter table p8_enrollments enable row level security;
alter table p8_drill_windows enable row level security;
alter table p8_drill_events enable row level security;
alter table p8_responses enable row level security;
alter table p8_scheduler_proposals enable row level security;

-- p8_sites: visible to anyone whose profile points to it. Created
-- and edited only by an admin. (A brand-new site is invisible to its
-- own creator until some profile's site_id points to it — fine for
-- this slice's single-seeded-site scope; multi-site admin onboarding
-- is future work, not solved here.)
create policy p8_sites_select_own on p8_sites
  for select using (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.site_id = p8_sites.id
    )
  );

create policy p8_sites_insert_admin on p8_sites
  for insert with check (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy p8_sites_update_admin_own on p8_sites
  for update using (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_sites.id
    )
  ) with check (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_sites.id
    )
  );

-- p8_profiles: everyone reads only their own row. There's no name
-- column here, but role/zone/shift still aren't admin's to browse —
-- nothing grants access to any row but your own, admin included.
create policy p8_profiles_select_self on p8_profiles
  for select using (auth.uid() = id);

-- Self-insert, and only as 'worker' — role is never self-assignable.
-- Admin accounts are seeded directly (service role), not signed up.
create policy p8_profiles_insert_self_worker on p8_profiles
  for insert with check (auth.uid() = id and role = 'worker');

-- p8_enrollments: worker-only, full stop. No admin policy of any
-- kind, on any command. This is the one Condition-3 guarantee that
-- cannot be allowed to be "mostly" true.
create policy p8_enrollments_select_self on p8_enrollments
  for select using (auth.uid() = worker_id);

create policy p8_enrollments_insert_self on p8_enrollments
  for insert with check (auth.uid() = worker_id);

create policy p8_enrollments_update_self on p8_enrollments
  for update using (auth.uid() = worker_id)
  with check (auth.uid() = worker_id);

create policy p8_enrollments_delete_self on p8_enrollments
  for delete using (auth.uid() = worker_id);

-- p8_drill_windows: admin-of-site only, every command. Workers never
-- query this table directly — they receive p8_drill_events instead.
create policy p8_drill_windows_select_admin on p8_drill_windows
  for select using (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_drill_windows.site_id
    )
  );

create policy p8_drill_windows_insert_admin on p8_drill_windows
  for insert with check (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_drill_windows.site_id
    )
  );

create policy p8_drill_windows_update_admin on p8_drill_windows
  for update using (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_drill_windows.site_id
    )
  ) with check (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_drill_windows.site_id
    )
  );

-- p8_drill_events: admin-of-site sees and creates all of them. A
-- worker sees only an event that actually targets them — same site,
-- and matching zone/shift when the event targets one (null means
-- "everyone eligible"). This is what lets Supabase Realtime deliver
-- the trigger to the right phones: Postgres Changes only broadcasts
-- a row to a client that could SELECT it under RLS.
create policy p8_drill_events_select_admin on p8_drill_events
  for select using (
    exists (
      select 1 from p8_drill_windows w
      join p8_profiles p on p.id = auth.uid()
      where w.id = p8_drill_events.window_id
        and p.role = 'admin'
        and p.site_id = w.site_id
    )
  );

create policy p8_drill_events_select_targeted_worker on p8_drill_events
  for select using (
    exists (
      select 1 from p8_drill_windows w
      join p8_profiles p on p.id = auth.uid()
      where w.id = p8_drill_events.window_id
        and p.role = 'worker'
        and p.site_id = w.site_id
        and (p8_drill_events.target_zone is null or p.zone = p8_drill_events.target_zone)
        and (p8_drill_events.target_shift is null or p.shift = p8_drill_events.target_shift)
    )
  );

create policy p8_drill_events_insert_admin on p8_drill_events
  for insert with check (
    exists (
      select 1 from p8_drill_windows w
      join p8_profiles p on p.id = auth.uid()
      where w.id = window_id
        and p.role = 'admin'
        and p.site_id = w.site_id
    )
  );

-- p8_responses: worker-only, same shape as p8_enrollments. No admin
-- policy here either — feature 7's aggregate dashboard reads through
-- a separate view (built in that feature), not a relaxed policy on
-- this table. Raw rows stay worker-only, which is what lets the
-- mechanical test prove the 5-response floor is real, not a UI choice.
create policy p8_responses_select_self on p8_responses
  for select using (auth.uid() = worker_id);

create policy p8_responses_insert_self on p8_responses
  for insert with check (auth.uid() = worker_id);

create policy p8_responses_update_self on p8_responses
  for update using (auth.uid() = worker_id)
  with check (auth.uid() = worker_id);

create policy p8_responses_delete_self on p8_responses
  for delete using (auth.uid() = worker_id);

-- p8_scheduler_proposals: admin-of-site only. Workers have no reason
-- to see a proposed next window before the admin has accepted it.
create policy p8_scheduler_proposals_select_admin on p8_scheduler_proposals
  for select using (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_scheduler_proposals.site_id
    )
  );

create policy p8_scheduler_proposals_insert_admin on p8_scheduler_proposals
  for insert with check (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_scheduler_proposals.site_id
    )
  );

create policy p8_scheduler_proposals_update_admin on p8_scheduler_proposals
  for update using (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_scheduler_proposals.site_id
    )
  ) with check (
    exists (
      select 1 from p8_profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.site_id = p8_scheduler_proposals.site_id
    )
  );
