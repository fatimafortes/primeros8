-- Migration 0004: let any signed-in user see which sites exist
-- Touches exactly one table: p8_sites. Adds one new SELECT policy —
-- does not touch or replace p8_sites_select_own from migration 0002.
-- Postgres OR's multiple permissive policies for the same command
-- together, so both stay in effect; this one is just broader.
--
-- Why: the enrollment form (feature 4) has to show which sites a
-- worker can enroll under, before they have a profile — and the
-- existing policy only grants access to a site once some profile
-- already points to it, which an unenrolled visitor can never
-- satisfy. Site name + timezone aren't sensitive (already shown
-- openly in the packet and mockup); nothing about individual
-- behavior, timing, or the trauma pre-check is exposed by this.

create policy p8_sites_select_any_authenticated on p8_sites
  for select using (auth.uid() is not null);
