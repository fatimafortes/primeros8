import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  userId: string;
  email: string | null;
  role: "admin" | "worker";
  siteId: string | null;
  zone: string | null;
  shift: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("p8_profiles")
    .select("role, site_id, zone, shift")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile.role,
    siteId: profile.site_id,
    zone: profile.zone,
    shift: profile.shift,
  };
}
