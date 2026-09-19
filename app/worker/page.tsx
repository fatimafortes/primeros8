import { getCurrentProfile } from "@/lib/profile";
import { WaitingRoom } from "@/components/WaitingRoom";

export default async function WorkerHomePage() {
  const profile = await getCurrentProfile();

  return <WaitingRoom zone={profile?.zone ?? null} shift={profile?.shift ?? null} />;
}
