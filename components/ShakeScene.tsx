"use client";

import { useEffect, useRef } from "react";

export function ShakeScene() {
  const audioStarted = useRef(false);

  useEffect(() => {
    if (audioStarted.current) return;
    audioStarted.current = true;

    try {
      const AudioContextCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContextCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 8);
      osc.onended = () => ctx.close();
    } catch {
      // Web Audio unavailable or blocked by autoplay policy — the
      // visual shake and the timer work regardless.
    }
  }, []);

  return (
    <div className="w-full max-w-xs">
      <div className="mb-2 inline-block rounded bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
        Simulación · escenario ficticio
      </div>
      <div className="p8-shake flex h-32 items-end justify-center gap-2 rounded border border-white/10 bg-zinc-900 p-4">
        <div className="h-16 w-8 rounded-sm bg-zinc-600" />
        <div className="h-24 w-8 rounded-sm bg-zinc-500" />
        <div className="h-12 w-8 rounded-sm bg-zinc-600" />
        <div className="h-20 w-8 rounded-sm bg-zinc-500" />
      </div>
    </div>
  );
}
