"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema } from "@/lib/validation";

export async function enroll(formData: FormData) {
  const parsed = enrollmentSchema.safeParse({
    siteId: formData.get("siteId"),
    zone: formData.get("zone"),
    shift: formData.get("shift"),
    consentTiming: formData.get("consentTiming"),
    consentIndividualScore: formData.get("consentIndividualScore"),
    consentDelete: formData.get("consentDelete"),
    traumaPrecheck: formData.get("traumaPrecheck"),
    optedOutOfImmersion: formData.get("optedOutOfImmersion") ?? undefined,
  });

  if (!parsed.success) {
    redirect(
      `/enroll?error=${encodeURIComponent(
        "Falta aceptar todas las condiciones o responder el chequeo privado.",
      )}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: profileError } = await supabase.from("p8_profiles").insert({
    id: user.id,
    role: "worker",
    site_id: parsed.data.siteId,
    zone: parsed.data.zone,
    shift: parsed.data.shift,
  });

  if (profileError) {
    redirect(`/enroll?error=${encodeURIComponent(profileError.message)}`);
  }

  const { error: enrollmentError } = await supabase.from("p8_enrollments").insert({
    worker_id: user.id,
    trauma_precheck: parsed.data.traumaPrecheck,
    opted_out_of_immersion: parsed.data.optedOutOfImmersion === "on",
  });

  if (enrollmentError) {
    redirect(`/enroll?error=${encodeURIComponent(enrollmentError.message)}`);
  }

  redirect("/worker");
}
