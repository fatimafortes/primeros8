import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";

export default async function StartPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/enroll");
  }

  redirect(profile.role === "admin" ? "/admin" : "/worker");
}
