"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { drillWindowSchema, mxLocalToInstant } from "@/lib/validation";
import { randomFireAt, SCENARIO_VARIANTS } from "@/lib/scheduler";

export async function createDrillWindow(formData: FormData) {
  const raw = {
    siteId: formData.get("siteId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    targetZone: formData.get("targetZone") || undefined,
    targetShift: formData.get("targetShift") || undefined,
    scenarioVariant: formData.get("scenarioVariant") || undefined,
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

  const startsAtIso = mxLocalToInstant(parsed.data.startsAt);
  const endsAtIso = mxLocalToInstant(parsed.data.endsAt);

  const { error } = await supabase.from("p8_drill_windows").insert({
    site_id: parsed.data.siteId,
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    created_by: user?.id,
    fire_at: randomFireAt(startsAtIso, endsAtIso),
    target_zone: parsed.data.targetZone ?? null,
    target_shift: parsed.data.targetShift ?? null,
    scenario_variant: parsed.data.scenarioVariant ?? SCENARIO_VARIANTS[0],
  });

  if (error) {
    redirect(`/admin/drills/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/drills");
}

// One-click demo helper: starts now, ends in 30 minutes. Same insert
// shape as createDrillWindow, no date/time inputs to get wrong.
export async function createTestWindow(formData: FormData) {
  const siteId = formData.get("siteId");
  if (typeof siteId !== "string") redirect("/admin/drills/new");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
  const startsAtIso = startsAt.toISOString();
  const endsAtIso = endsAt.toISOString();

  const { error } = await supabase.from("p8_drill_windows").insert({
    site_id: siteId,
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    created_by: user?.id,
    fire_at: randomFireAt(startsAtIso, endsAtIso),
    scenario_variant: SCENARIO_VARIANTS[0],
  });

  if (error) {
    redirect(`/admin/drills/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/drills");
}

// Demo override, admin-only, same p8_drill_events shape pg_cron's
// automatic firing produces. Only works inside the window's own
// [starts_at, ends_at] — same rule item 1's validation already
// enforces at creation time, checked again here since "now" has
// moved on by the time anyone clicks this.
export async function fireWindowNow(formData: FormData) {
  const windowId = formData.get("windowId");
  if (typeof windowId !== "string") redirect("/admin/drills");

  const supabase = await createClient();

  const { data: window } = await supabase
    .from("p8_drill_windows")
    .select("id, starts_at, ends_at, status, target_zone, target_shift, scenario_variant")
    .eq("id", windowId)
    .maybeSingle();

  if (!window || window.status !== "scheduled") {
    redirect(
      `/admin/drills?error=${encodeURIComponent("Esa ventana ya no está programada.")}`,
    );
  }

  const now = Date.now();
  if (
    now < new Date(window.starts_at).getTime() ||
    now > new Date(window.ends_at).getTime()
  ) {
    redirect(
      `/admin/drills?error=${encodeURIComponent(
        "No se puede disparar fuera de la ventana programada.",
      )}`,
    );
  }

  const { error: eventError } = await supabase.from("p8_drill_events").insert({
    window_id: window.id,
    target_zone: window.target_zone,
    target_shift: window.target_shift,
    scenario_variant: window.scenario_variant ?? SCENARIO_VARIANTS[0],
  });

  if (eventError) {
    redirect(`/admin/drills?error=${encodeURIComponent(eventError.message)}`);
  }

  await supabase
    .from("p8_drill_windows")
    .update({ status: "fired" })
    .eq("id", window.id);

  redirect("/admin/drills");
}
