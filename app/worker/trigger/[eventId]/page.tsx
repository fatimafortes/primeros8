import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TriggerScreen } from "@/components/TriggerScreen";

export default async function TriggerPage(
  props: PageProps<"/worker/trigger/[eventId]">,
) {
  const { eventId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("p8_drill_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) notFound();

  const { data: enrollment } = await supabase
    .from("p8_enrollments")
    .select("opted_out_of_immersion")
    .eq("worker_id", user.id)
    .maybeSingle();

  const immersionPath = enrollment?.opted_out_of_immersion
    ? "non_immersive"
    : "immersive";

  return <TriggerScreen eventId={eventId} immersionPath={immersionPath} />;
}
