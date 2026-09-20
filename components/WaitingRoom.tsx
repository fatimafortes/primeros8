"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { findPendingEventId } from "@/lib/pendingEvent";

type DrillEventRow = {
  id: string;
  target_zone: string | null;
  target_shift: string | null;
};

// Realtime is the fast path when it works; this is what actually
// guarantees delivery. A missed/failed websocket connection (auth
// race on first subscribe, a dropped connection, a publication
// toggle that didn't survive) should never mean the drill just never
// arrives — it means it arrives a few seconds late instead.
const POLL_INTERVAL_MS = 5000;

export function WaitingRoom({
  zone,
  shift,
}: {
  zone: string | null;
  shift: string | null;
}) {
  const router = useRouter();
  const [channelStatus, setChannelStatus] = useState("conectando…");
  const [channelError, setChannelError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function setupChannel() {
      // Explicit, not assumed: attach the current session's token to
      // the realtime connection before subscribing. supabase-js is
      // supposed to wire this automatically via an internal
      // accessToken callback, but that callback needs a session
      // that's already resolved from cookies — on a fresh page load
      // the websocket handshake can fire before that resolves,
      // connecting unauthenticated and failing RLS at the connection
      // level (CHANNEL_ERROR), not the row-filtering level.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase.realtime.setAuth(session.access_token);
      }
      if (cancelled) return;

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
            console.log(
              "[WaitingRoom] zoneMatches",
              zoneMatches,
              "shiftMatches",
              shiftMatches,
            );
            if (zoneMatches && shiftMatches) {
              router.push(`/worker/trigger/${event.id}`);
            }
          },
        )
        .subscribe((status, err) => {
          console.log("[WaitingRoom] channel status:", status, err ?? "");
          setChannelStatus(status);
          setChannelError(err?.message ?? null);
        });

      return channel;
    }

    const channelPromise = setupChannel();

    // Polling fallback — independent of whatever the channel above is
    // doing. Same RLS-gated query the diagnostic already proved
    // returns real rows for this worker, just run repeatedly instead
    // of once.
    const pollInterval = setInterval(async () => {
      const pendingEventId = await findPendingEventId(supabase);
      if (pendingEventId) {
        router.push(`/worker/trigger/${pendingEventId}`);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [zone, shift, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-950 px-6 text-center text-zinc-50">
      <p className="text-sm text-zinc-400">Esperando el simulacro…</p>
      <p className="text-xs text-zinc-600">No sabrás cuándo. Esa es la idea.</p>
      <p className="mt-4 font-mono text-[10px] text-zinc-700">
        canal: {channelStatus}
        {channelError ? ` — ${channelError}` : ""}
      </p>
    </div>
  );
}
