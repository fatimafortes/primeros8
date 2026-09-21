"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// No websocket, no client-side query. router.refresh() re-runs
// /worker/page.tsx's server-side check on a timer — that check is
// the only thing that decides whether to redirect.
const REFRESH_INTERVAL_MS = 5000;

export function WaitingRoom() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-950 px-6 text-center text-zinc-50">
      <p className="text-sm text-zinc-400">Esperando el simulacro…</p>
      <p className="text-xs text-zinc-600">No sabrás cuándo. Esa es la idea.</p>
    </div>
  );
}
