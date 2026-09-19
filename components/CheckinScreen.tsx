"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";

export function CheckinScreen({
  responseId,
  protectiveActionAt,
  assignedZone,
}: {
  responseId: string;
  protectiveActionAt: string;
  assignedZone: string | null;
}) {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const start = new Date(protectiveActionAt).getTime();
    const interval = setInterval(() => setElapsedMs(Date.now() - start), 200);
    return () => clearInterval(interval);
  }, [protectiveActionAt]);

  async function submitCheckin(locationVerified: boolean) {
    const timeToAssemblyMs =
      Date.now() - new Date(protectiveActionAt).getTime();
    const supabase = createClient();
    const { error } = await supabase
      .from("p8_responses")
      .update({
        geo_checkin_at: new Date().toISOString(),
        time_to_assembly_ms: timeToAssemblyMs,
        location_zone_estimate: assignedZone,
        location_verified: locationVerified,
      })
      .eq("id", responseId);

    if (error) {
      setSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    router.push(`/worker/debrief/${responseId}`);
  }

  function handleCheckin() {
    if (submitting) return;
    setSubmitting(true);

    if (!("geolocation" in navigator)) {
      submitCheckin(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => submitCheckin(true),
      () => submitCheckin(false),
      { timeout: 8000 },
    );
  }

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-xl font-bold">Punto de reunión</h1>
        <p className="text-sm text-zinc-400">
          Camina al punto de reunión de tu zona y confirma tu llegada.
        </p>
        <p className="font-mono text-4xl font-bold tabular-nums">
          {mm}:{ss}
        </p>
        {errorMessage && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}
        <button
          onClick={handleCheckin}
          disabled={submitting}
          className="w-full max-w-xs rounded-full bg-amber-400 px-6 py-4 text-lg font-bold text-zinc-950 disabled:opacity-50"
        >
          Confirmar llegada
        </button>
        <p className="text-xs text-zinc-500">
          Si no compartes ubicación, tu llegada se registra igual, marcada
          como no verificada.
        </p>
      </div>
      <DisclaimerFooter />
    </div>
  );
}
