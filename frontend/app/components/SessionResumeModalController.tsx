"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "../providers/session-provider";

export default function SessionResumeModalController() {
  const {
    activeSession,
    loading,
    resumeSession,
    pauseSession,
    cancelSession,
    sessionActionLoading,
  } = useSession();
//Allows the user to resume a session should they leave and return
  const [open, setOpen] = useState(false);
  const hasCheckedInitialSession = useRef(false);

  useEffect(() => {
    if (loading || hasCheckedInitialSession.current) return;

    hasCheckedInitialSession.current = true;

    if (activeSession) {
      setOpen(true);
    }
  }, [loading, activeSession]);

  if (!open || !activeSession) return null;

  const isPaused = activeSession.status === "PAUSED";
//Save paused status
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Existing study session found"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1C1836]">
        <h2 className="text-xl font-bold text-[#235937] dark:text-white">
          Existing study session found
        </h2>

        <p className="mt-3 text-sm text-black/80 dark:text-white/80">
          You already have a study session in progress.
          {isPaused ? " It is currently paused." : " It is currently active."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => setOpen(false)}
              className="rounded-xl bg-[#235937] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            Resume Session
          </button>

          <button
            type="button"
            onClick={async () => {
              await cancelSession();
              setOpen(false);
            }}
            disabled={sessionActionLoading}
            className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {sessionActionLoading ? "Working..." : "End Session"}
          </button>
        </div>
      </div>
    </div>
  );
}