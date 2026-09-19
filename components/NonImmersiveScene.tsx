"use client";

import { useEffect } from "react";

export function NonImmersiveScene() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
    }
  }, []);

  return (
    <div className="w-full max-w-xs">
      <div className="mb-2 inline-block rounded bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
        Simulación · escenario ficticio
      </div>
      <div className="flex h-32 flex-col items-center justify-center gap-2 rounded border border-white/10 bg-zinc-900 p-4">
        <p className="text-lg font-semibold">SISMO SIMULADO</p>
        <p className="text-xs text-zinc-500">
          Camino sin inmersión — vibración activada
        </p>
      </div>
    </div>
  );
}
