"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { proposeNextDrill, randomFireAt, type ZoneAggregate } from "@/lib/scheduler";
import { mxDateOnly, mxLocalToInstant } from "@/lib/validation";

export async function proposeNextWindow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("p8_profiles")
    .select("site_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.site_id) redirect("/admin/dashboard");

  const { data } = await supabase.rpc("p8_site_aggregates");
  const aggregates = (data ?? []) as ZoneAggregate[];

  const { count } = await supabase
    .from("p8_scheduler_proposals")
    .select("id", { count: "exact", head: true })
    .eq("site_id", profile.site_id);

  const proposal = proposeNextDrill(aggregates, count ?? 0);

  if (!proposal) {
    redirect(
      `/admin/dashboard?error=${encodeURIComponent(
        "Aún no hay suficientes datos para proponer la siguiente ventana.",
      )}`,
    );
  }

  const targetDate = mxDateOnly(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const proposedStartsAt = mxLocalToInstant(`${targetDate}T10:00`);
  const proposedEndsAt = mxLocalToInstant(`${targetDate}T14:00`);

  const { error } = await supabase.from("p8_scheduler_proposals").insert({
    site_id: profile.site_id,
    proposed_starts_at: proposedStartsAt,
    proposed_ends_at: proposedEndsAt,
    proposed_variant: proposal.scenarioVariant,
    target_zone: proposal.targetZone,
    target_shift: proposal.targetShift,
    rationale: proposal.rationale,
  });

  if (error) {
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/dashboard");
}

export async function acceptProposal(formData: FormData) {
  const proposalId = formData.get("proposalId");
  if (typeof proposalId !== "string") redirect("/admin/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: proposal } = await supabase
    .from("p8_scheduler_proposals")
    .select(
      "id, site_id, proposed_starts_at, proposed_ends_at, proposed_variant, target_zone, target_shift, status",
    )
    .eq("id", proposalId)
    .maybeSingle();
  if (!proposal || proposal.status !== "pending") redirect("/admin/dashboard");

  const { error: windowError } = await supabase
    .from("p8_drill_windows")
    .insert({
      site_id: proposal.site_id,
      starts_at: proposal.proposed_starts_at,
      ends_at: proposal.proposed_ends_at,
      created_by: user.id,
      fire_at: randomFireAt(proposal.proposed_starts_at, proposal.proposed_ends_at),
      target_zone: proposal.target_zone,
      target_shift: proposal.target_shift,
      scenario_variant: proposal.proposed_variant,
    });

  if (windowError) {
    redirect(`/admin/dashboard?error=${encodeURIComponent(windowError.message)}`);
  }

  await supabase
    .from("p8_scheduler_proposals")
    .update({ status: "accepted" })
    .eq("id", proposal.id);

  redirect("/admin/drills");
}
