import type { SupabaseClient } from "@supabase/supabase-js";

// Shared by the server-side reload-check (/worker/page.tsx) and the
// client-side polling fallback (WaitingRoom) — same query, same
// logic, run through whichever Supabase client the caller has (both
// server and browser clients expose the same .from() surface, so one
// function covers both without duplicating the "which event is
// actually pending" rule in two places that could drift apart).
export async function findPendingEventId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data: recentEvents } = await supabase
    .from("p8_drill_events")
    .select("id")
    .order("fired_at", { ascending: false })
    .limit(5);

  if (!recentEvents || recentEvents.length === 0) return null;

  const { data: existingResponses } = await supabase
    .from("p8_responses")
    .select("drill_event_id")
    .in(
      "drill_event_id",
      recentEvents.map((e) => e.id),
    );

  const respondedIds = new Set(
    (existingResponses ?? []).map((r) => r.drill_event_id),
  );
  const pending = recentEvents.find((e) => !respondedIds.has(e.id));
  return pending?.id ?? null;
}
