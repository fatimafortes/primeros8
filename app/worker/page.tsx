import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { findPendingEventId } from "@/lib/pendingEvent";
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
  const pendingEventId = await findPendingEventId(supabase);
  if (pendingEventId) {
    redirect(`/worker/trigger/${pendingEventId}`);
  }

  return (
    <WaitingRoom zone={profile?.zone ?? null} shift={profile?.shift ?? null} />
  );
}
