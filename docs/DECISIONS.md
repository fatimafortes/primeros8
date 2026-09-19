# DECISIONS — PRIMEROS 8

One entry per work session: what got decided, what's next, in that order.
Updated at the end of every session per WEEK6's Session Close rule, before commit + push.

---

## 2026-09-18 — Feature 1: scaffold

- Scaffolded with `create-next-app` (Next.js 16.3.5, App Router, TypeScript, Tailwind v4). Node 24, npm 11.
- **Next.js 16 breaking change caught before writing any route logic:** `middleware.ts` is deprecated,
  renamed to `proxy.ts` (same behavior, `export function proxy(request)` instead of `middleware`).
  The role-gating work planned for feature 3 will use `proxy.ts`, not `middleware.ts` — the build plan
  said `middleware.ts`, that was written against older Next.js docs and is now corrected.
- `cookies()` from `next/headers` is async in this version — the Supabase server client helper
  (`lib/supabase/server.ts`) awaits it, following the official `@supabase/ssr` App Router pattern.
- Added `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server, cookie-based session).
  No service-role client yet — that's only needed for feature 2's seed script, added there, not before.
- Added `components/DisclaimerFooter.tsx` now, even though it's only feature 5/6's job to place it on
  every worker screen — it's a shared component so there's one source of truth for the exact disclaimer
  wording (Blueprint condition 6), not a copy-pasted string per screen.
- `.env.example` documents variable names only; `.env*` was already gitignored by the scaffold.
- `app/health` gives a browser-checkable Supabase connectivity signal without needing a real session yet.

**Tomorrow's first move:** get the Supabase project created, env vars set in Vercel, push, and confirm
Deploy 1 — the live URL must work on this trivial scaffold before any auth/OAuth work begins (per the
plan change to move Deploy 1 here, ahead of features 2–3).

---

## 2026-09-19 — Migrations 0001–0005, auth, features 3–6

- **Deploy 1 confirmed** on the live Vercel URL before any auth work — plan change from the previous
  session held.
- Reusing an existing shared Supabase project (other coursework lives in it). Hard rules followed on
  every migration since: `p8_` prefix on every new object, no `DROP`/`TRUNCATE`/`ALTER`/`DELETE` against
  anything outside `p8_`, additive only, seed script only inserts into `p8_` tables. Migrations 0001–0005
  all ran clean against it.
- **Migration 0001:** the seven `p8_` tables. `zone`/`shift` are `CHECK`-constrained text, not custom
  enum types — enums are painful to extend additively later.
- **Migration 0002:** RLS on all seven tables. `p8_enrollments` and `p8_responses` are worker-self-only
  on every command, no admin policy on either, anywhere — the trauma pre-check and individual response
  rows are unreachable by admin by construction, not by a "deny" rule.
- **Corrected in the packet, not just the schema:** section 9 originally described a "location-at-trigger"
  signal as if the scheduler read a live GPS point at the moment the trigger fired. It doesn't — the only
  geolocation read is at assembly-point check-in. A second live read would be worker tracking, which
  Blueprint condition 3 rules out. Fixed to say what's actually stored: assigned zone/shift + time-to-
  assembly + a verified flag.
- **Migration 0003:** dropped the FK from `p8_profiles.id` to `auth.users(id)`. Found this the hard way —
  invented seed workers can never have a real `auth.users` row (they never log in), and creating one would
  mean inserting into `auth.users`, which "the seed script only inserts into `p8_` tables" already rules
  out. Real accounts are unaffected: `id` stays the primary key, still set to `auth.uid()` by convention,
  every RLS policy from 0002 keeps working unchanged since they compare against `auth.uid()` at query
  time, not the constraint.
- Feature 2 seed (`supabase/seed.sql`) is written — one site, one admin profile, 8 invented workers split
  3/5 across Zona A / Zona B so the 5-response floor is visibly crossed in one zone and not the other —
  but **not yet run**. It has one placeholder, `REPLACE_WITH_YOUR_AUTH_USERS_ID`, twice. Sent the real ID
  twice now and got a literal placeholder string both times (`<pega aquí el id>`, then `<el id>`) — not
  filling it in until an actual UUID arrives.
- Dropped `SUPABASE_SERVICE_ROLE_KEY` from `.env.example`/`.env.local` entirely, on request. Nothing in
  the running app needs it: seeding goes through the Supabase SQL Editor (superuser, bypasses RLS), and
  every aggregate read goes through a `SECURITY DEFINER` function, not an app-level privileged client.
- Built Google OAuth end to end: `app/login`, `app/auth/callback` (exchanges the code for a session,
  server-side so cookies can be set), `app/auth/signout`, `app/account` (prints the signed-in user's
  `auth.users.id` in plain text so it can be copied straight into the seed, instead of digging through
  the Supabase dashboard).
- **Feature 3 (admin):** `proxy.ts` (Next 16's `middleware.ts` rename) redirects unauthenticated requests
  away from protected prefixes; `app/admin/layout.tsx` does the finer-grained role check. Sites, drill
  windows (past-date rejected inline), drills list. Creating an *additional* site is a documented dead
  end for now — RLS makes a brand-new site invisible to its own creator until some profile's `site_id`
  points to it; noted inline in the form rather than silently broken.
- **Migration 0004 (drafted, not yet run):** a second, broader `SELECT` policy on `p8_sites` — any signed-
  in user can see site name/timezone, not just ones their profile already points to. Needed because the
  enrollment form has to show which sites exist *before* a worker has a profile at all — the original
  policy from 0002 can never be satisfied by someone who hasn't enrolled yet. Site names aren't sensitive;
  nothing about individual behavior is exposed by this.
- **Feature 4 (worker enrollment):** one submit creates both the `p8_profiles` row and the
  `p8_enrollments` row together — deliberately, not self-insert-then-self-update, since no self-UPDATE
  policy exists on `p8_profiles` by design. `WaitingRoom` subscribes to `p8_drill_events` over Supabase
  Realtime and client-side-navigates to the trigger screen on a match, no reload. **Still needs the
  Realtime publication toggle for `p8_drill_events` in the Supabase dashboard** (Database → Replication) —
  can't do this from SQL without touching a non-`p8_` object (the `supabase_realtime` publication), so
  it's a dashboard click, not a migration.
- **Feature 5 (trigger):** CSS keyframe shake + Web Audio square-wave alarm, no Three.js/WebXR (the
  pre-committed cut from the packet). React 19's purity lint caught `Date.now()` called directly in a
  `useRef` initializer during render — moved into a `useEffect`. Both the immersive and non-immersive
  paths share one `TriggerScreen` shell (same banner, timer, button, footer) — only the middle "scene"
  differs, matching the Condition 2 acceptance criterion added in the Phase 1 review.
- **Feature 6 (check-in/debrief):** `time_to_assembly_ms` measures from `protective_action_at`, not from
  when the check-in page mounts. Location zone estimate reuses the worker's assigned zone rather than
  trying to geo-map a real GPS reading onto invented, non-real zones — there's no real floor plan to
  geo-fence against. Debrief's "your zone's average" needed a second `SECURITY DEFINER` function
  (**migration 0005, drafted, not yet run**) — a worker's own RLS is self-only on `p8_responses` too, same
  wall feature 7 was always going to hit for admin. `deleteMyData` removes `p8_responses` +
  `p8_enrollments` (the measured data condition 3 names), not the profile row.
- Disclaimer footer now confirmed present on all four worker-facing screens (enrollment, trigger,
  check-in, debrief) — one more than the three originally mocked, added to check-in too for consistency.

**Confirmed same day:** Google sign-in works on the live URL. Migration 0004's policy was already in
effect (existed before I asked for it to run — noted, not chased further). Migration 0005 ran clean.
`p8_drill_events` is on in the `supabase_realtime` publication. Real `auth.users.id` received
(`a83f58b2-f3cf-4b05-9113-1e4b5082172e`) and filled into `seed.sql`, committed — not yet run.

- **Feature 7 (admin dashboard):** `p8_site_aggregates()` (**migration 0006, drafted, not yet run**) — same
  `SECURITY DEFINER` + pinned `search_path` pattern as 0005, but resolves the caller's *site* instead of
  their own zone, and returns every zone/shift at that site. Gated by role inside the function itself
  (`where role = 'admin'` in the first CTE) — a worker calling it gets zero rows back, not another zone's
  data, so the gate doesn't depend on the app never calling it from the wrong place.
  Also caught and fixed: `/start` was already redirecting admins to `/admin`, which had no `page.tsx`
  under the layout and would have 404'd — added it, redirects to `/admin/dashboard`.
- **Feature 8 (adaptive scheduler):** `lib/scheduler.ts` is a pure function, no Supabase/Next imports —
  picks the zone/shift with the worst combined protective-action + assembly time among zone/shifts at or
  above the 5-response floor, returns `null` (no fake proposal) if nothing has crossed it yet. Scenario
  variant rotates through a fixed 3-item list, indexed by how many proposals the site has already made —
  deterministic, not random. Computed on page load / button click, not a cron — no Vercel Cron needed.
  Scope cut, stated plainly: "edit before accepting" is "schedule a different window manually instead"
  (the existing `/admin/drills/new` form), not a dedicated inline-edit UI for the proposal's own fields.

**Still pending on the Supabase side, none of it run yet:**
1. Migration 0006 (`p8_site_aggregates()` function) — blocks the admin dashboard and the scheduler both.
2. `seed.sql` — ID is filled in and committed, ready to run.

**Tomorrow's first move:** run 0006, then `seed.sql`, then do a full live walkthrough end to end on both
roles — admin (schedule → dashboard → propose → accept) and worker (enroll → wait → trigger → protect →
check in → debrief) — to see what the mechanical test pass (feature 9) actually catches.
