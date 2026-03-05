"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "Inhale" | "Hold" | "Exhale";

export default function BreatheModal({
  inhaleMs = 4000,
  holdMs = 2000,
  exhaleMs = 4000,
}: {
  inhaleMs?: number;
  holdMs?: number;
  exhaleMs?: number;
}) {
  const OUTER = 280; // max guide
  const INNER = 96;  // min guide

  const duration = inhaleMs + holdMs + exhaleMs;
  const minScale = INNER / OUTER;
  const maxScale = 1;

  const [phase, setPhase] = useState<Phase>("Inhale");
  const startRef = useRef<number | null>(null);

  // Keyframes: min -> max during inhale, hold max, then back to min
  const keyFrames = useMemo(() => {
    const inhaleEndPct = (inhaleMs / duration) * 100;
    const holdEndPct = ((inhaleMs + holdMs) / duration) * 100;

    return `
      @keyframes breathePulse {
        0% { transform: scale(${minScale}); }
        ${inhaleEndPct}% { transform: scale(${maxScale}); }
        ${holdEndPct}% { transform: scale(${maxScale}); }
        100% { transform: scale(${minScale}); }
      }
    `;
  }, [inhaleMs, holdMs, duration, minScale, maxScale]);

  // Phase label driven by the same timeline as the animation
  useEffect(() => {
    startRef.current = null;

    let rafId = 0;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = elapsed % duration;

      const nextPhase: Phase =
        t < inhaleMs ? "Inhale" :
        t < inhaleMs + holdMs ? "Hold" :
        "Exhale";

      // avoid extra renders
      setPhase((p) => (p === nextPhase ? p : nextPhase));

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inhaleMs, holdMs, exhaleMs, duration]);

  return (
    <div className="inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <style>{keyFrames}</style>

      <div className="relative w-full max-w-2xl bg-[#7d7f7c] rounded-xl shadow-lg p-6 h-[50vh] overflow-hidden flex flex-col">
        <div className="w-full border-b border-white/20 pb-4 mb-4">
          <p className="text-center text-white font-semibold text-lg">Practice this exercise</p>
        </div>

        <div className="relative flex-1 flex items-center justify-center">
          {/* OUTER GUIDE (max) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: OUTER, height: OUTER, backgroundColor: "#006884" }}
            aria-hidden
          />

          {/* ANIMATED CIRCLE */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: OUTER,
              height: OUTER,
              backgroundColor: "#ADD8E6",
              animation: `breathePulse ${duration}ms ease-in-out infinite`,
              transformOrigin: "center",
              willChange: "transform",
            }}
            aria-hidden
          />

          {/* INNER GUIDE (min) + LABEL */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center"
            style={{ width: INNER, height: INNER, backgroundColor: "#85C7EB" }}
          >
            <span className="font-semibold text-black select-none">{phase}</span>
          </div>
        </div>
      </div>
    </div>
  );
}