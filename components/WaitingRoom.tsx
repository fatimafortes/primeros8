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
      console.log("[WaitingRoom] refresh tick");
      router.refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-950 px-6 text-center text-zinc-50">
      <h1 className="text-lg font-bold">
        Estás inscrito en el ensayo de seguridad
      </h1>
      <p className="max-w-xs text-sm text-zinc-400">
        En algún momento de tu turno sonará un ejercicio de sismo. Es un
        ensayo, no una emergencia real. Cuando empiece, tu teléfono
        vibrará y la pantalla se pondrá amarilla. Deja esta página
        abierta.
      </p>
      <p className="text-xs text-zinc-600">
        Tu resultado es solo tuyo. Tu planta solo ve promedios por zona.
      </p>
    </div>
  );
}
