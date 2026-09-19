"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteSchema } from "@/lib/validation";

export async function createSite(formData: FormData) {
  const parsed = siteSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    redirect(`/admin/sites?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("p8_sites").insert({
    name: parsed.data.name,
    timezone: parsed.data.timezone,
  });

  if (error) {
    redirect(`/admin/sites?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/sites");
}
