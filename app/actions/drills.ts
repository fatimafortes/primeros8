"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { drillWindowSchema } from "@/lib/validation";

export async function createDrillWindow(formData: FormData) {
  const raw = {
    siteId: formData.get("siteId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  };

  const parsed = drillWindowSchema.safeParse(raw);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    redirect(`/admin/drills/new?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("p8_drill_windows").insert({
    site_id: parsed.data.siteId,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    created_by: user?.id,
  });

  if (error) {
    redirect(`/admin/drills/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/drills");
}
