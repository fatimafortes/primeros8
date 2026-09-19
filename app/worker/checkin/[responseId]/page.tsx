import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { CheckinScreen } from "@/components/CheckinScreen";

export default async function CheckinPage(
  props: PageProps<"/worker/checkin/[responseId]">,
) {
  const { responseId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: response } = await supabase
    .from("p8_responses")
    .select("id, protective_action_at, geo_checkin_at")
    .eq("id", responseId)
    .maybeSingle();
  if (!response || !response.protective_action_at) notFound();

  if (response.geo_checkin_at) {
    redirect(`/worker/debrief/${responseId}`);
  }

  const profile = await getCurrentProfile();

  return (
    <CheckinScreen
      responseId={responseId}
      protectiveActionAt={response.protective_action_at}
      assignedZone={profile?.zone ?? null}
    />
  );
}
