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
