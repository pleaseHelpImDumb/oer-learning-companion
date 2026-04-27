"use client";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AppShell from "../components/AppShell";
import Robot from "../components/RobotEmoji";
import { StuckAssistantProvider } from "../providers/stuck-assistance-provider";
import { useSession } from "../providers/session-provider";

export default function LayoutInner({
  children,
  hideLayout,
}: {
  children: React.ReactNode;
  hideLayout: boolean;
}) {
  const {
    activeSession,
    loading,
    cancelSession,
    pauseSession,
    resumeSession,
    sessionActionLoading,
  } = useSession();
  console.log("[LAYOUT] useSession returned:", {
    activeSession,
    loading,
    cancelSession,
    pauseSession,
    resumeSession,
    sessionActionLoading,
  });
  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <StuckAssistantProvider>
        <AppShell>
<div className="mx-auto w-[95vw] max-w-[1800px] px-4">{children}</div>
          
        </AppShell>
        <Robot />
      </StuckAssistantProvider>
      {/*<SiteFooter />*/}
    </div>
  );
}

          {/*{loading && (
            <div className="mx-4 mt-4 rounded-xl border border-[#d8d8d8] bg-[#fdf5e7] px-4 py-3 text-sm font-medium text-[#235937] shadow-sm">
              Checking active session...
            </div>
          )}

          {!loading && activeSession && (
            <div className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl border border-[#d8d8d8] bg-[#235937] px-4 py-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="text-left">
                <p className="text-base font-semibold text-white sm:text-lg">
                  Study session in progress
                </p>
                <p className="text-sm text-[#fbeabd]">
                  Keep going — your session is currently active.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if(activeSession.status!=="PAUSED"){
                      void pauseSession();
                    } else{
                      void resumeSession();
                    }
                  }}
                  disabled={sessionActionLoading}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#235937] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sessionActionLoading ? "Working..." : activeSession.status=="ACTIVE" ? "Pause Session" : "Resume Session"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void cancelSession();
                  }}
                  disabled={sessionActionLoading}
                  className="rounded-xl bg-[#ffd36b] px-4 py-2 text-sm font-semibold text-[#235937] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sessionActionLoading ? "Stopping..." : "Stop Session"}
                </button>
              </div>
            </div>
          )}*/}