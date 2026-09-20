import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { WaitingRoom } from "@/components/WaitingRoom";

export default async function WorkerHomePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // Covers reload / a backgrounded tab / a missed realtime delivery:
  // check for an event that already exists and already targets this
  // worker (RLS on p8_drill_events already filters to only those),
  // not just "wait for the next live INSERT." Without this, a fired
  // event that arrived before the tab was subscribed is invisible
  // forever, no matter how many times the page reloads.
  const { data: recentEvents } = await supabase
    .from("p8_drill_events")
    .select("id")
    .order("fired_at", { ascending: false })
    .limit(5);

  if (recentEvents && recentEvents.length > 0) {
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
    if (pending) {
      redirect(`/worker/trigger/${pending.id}`);
    }
  }

  return (
    <WaitingRoom zone={profile?.zone ?? null} shift={profile?.shift ?? null} />
  );
}
