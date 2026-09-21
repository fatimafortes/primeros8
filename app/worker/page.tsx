import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findPendingEventId } from "@/lib/pendingEvent";
import { WaitingRoom } from "@/components/WaitingRoom";

function fifteenMinutesAgoIso(): string {
  return new Date(Date.now() - 15 * 60 * 1000).toISOString();
}

export default async function WorkerHomePage() {
  const supabase = await createClient();

  const pendingEventId = await findPendingEventId(supabase, {
    sinceIso: fifteenMinutesAgoIso(),
  });
  if (pendingEventId) {
    redirect(`/worker/trigger/${pendingEventId}`);
  }

  return <WaitingRoom />;
}
