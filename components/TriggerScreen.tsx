"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { ShakeScene } from "@/components/ShakeScene";
import { NonImmersiveScene } from "@/components/NonImmersiveScene";

export function TriggerScreen({
  eventId,
  immersionPath,
}: {
  eventId: string;
  immersionPath: "immersive" | "non_immersive";
}) {
  const router = useRouter();
  const startRef = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  async function handleProtect() {
    if (submitting) return;
    setSubmitting(true);
    const timeToProtectiveActionMs = Date.now() - startRef.current;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("p8_responses")
      .insert({
        drill_event_id: eventId,
        worker_id: user.id,
        immersion_path: immersionPath,
        protective_action_at: new Date().toISOString(),
        time_to_protective_action_ms: timeToProtectiveActionMs,
      })
      .select("id")
      .single();

    if (error || !data) {
      setSubmitting(false);
      return;
    }

    router.push(`/worker/checkin/${data.id}`);
  }

  async function handleExit() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("p8_responses").insert({
      drill_event_id: eventId,
      worker_id: user.id,
      immersion_path: immersionPath,
      exited_early: true,
    });

    router.push("/worker");
  }

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  const tenths = Math.floor((elapsedMs % 1000) / 100);

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <div className="bg-amber-400 px-4 py-3 text-center text-sm font-bold text-zinc-950">
        SIMULACRO SIN AVISO · ESTO ES UN EJERCICIO
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        {immersionPath === "immersive" ? <ShakeScene /> : <NonImmersiveScene />}

        <p className="font-mono text-6xl font-bold tabular-nums">
          {mm}:{ss}
          <span className="text-2xl">.{tenths}</span>
        </p>
        <p className="text-sm text-zinc-400">Agáchate, cúbrete, sujétate.</p>

        <button
          onClick={handleProtect}
          disabled={submitting}
          className="w-full max-w-xs rounded-full bg-red-500 px-6 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          Estoy protegido
        </button>
        <button
          onClick={handleExit}
          className="text-sm text-zinc-400 underline"
        >
          Salir del ejercicio
        </button>
      </div>

      <DisclaimerFooter />
    </div>
  );
}
