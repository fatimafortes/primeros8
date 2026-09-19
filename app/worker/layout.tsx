import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";

export default async function WorkerLayout({ children }: LayoutProps<"/worker">) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "worker") {
    redirect("/start");
  }

  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
