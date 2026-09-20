"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DrillEventRow = {
  id: string;
  target_zone: string | null;
  target_shift: string | null;
};

export function WaitingRoom({
  zone,
  shift,
}: {
  zone: string | null;
  shift: string | null;
}) {
  const router = useRouter();
  const [channelStatus, setChannelStatus] = useState("conectando…");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("p8_drill_events_worker")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "p8_drill_events" },
        (payload) => {
          console.log("[WaitingRoom] INSERT received", payload);
          const event = payload.new as DrillEventRow;
          const zoneMatches = !event.target_zone || event.target_zone === zone;
          const shiftMatches = !event.target_shift || event.target_shift === shift;
          console.log("[WaitingRoom] zoneMatches", zoneMatches, "shiftMatches", shiftMatches);
          if (zoneMatches && shiftMatches) {
            router.push(`/worker/trigger/${event.id}`);
          }
        },
      )
      .subscribe((status, err) => {
        console.log("[WaitingRoom] channel status:", status, err ?? "");
        setChannelStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [zone, shift, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-950 px-6 text-center text-zinc-50">
      <p className="text-sm text-zinc-400">Esperando el simulacro…</p>
      <p className="text-xs text-zinc-600">No sabrás cuándo. Esa es la idea.</p>
      <p className="mt-4 font-mono text-[10px] text-zinc-700">
        canal: {channelStatus}
      </p>
    </div>
  );
}
