"use client";

import TicTacToe from "@/app/components/ticTacToe";
import { useRecentSessions } from "@/app/providers/recent-session-provider";
import { useSession } from "@/app/providers/session-provider";

export default function TicTacToePage() {
  const GAME_COST = 4;

  const { activeSession, liveStudySeconds } = useSession();

  const {
    sessions24hrs,
    refreshSessions24hrs,
  } = useRecentSessions();

  const currentSessionSpent =
    sessions24hrs.find(
      (s) => s.status === "ACTIVE" || s.status === "PAUSED"
    )?.tokensSpent ?? 0;

  const liveCurrentSessionTokens = activeSession
    ? Math.max(0, Math.floor(liveStudySeconds / 300) - currentSessionSpent)
    : 0;

  const completed24hrTokens = sessions24hrs
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => {
      const earned = s.tokensEarned ?? 0;
      const spent = s.tokensSpent ?? 0;
      return sum + Math.max(0, earned - spent);
    }, 0);

  const availableTokens = completed24hrTokens + liveCurrentSessionTokens;

  async function spendGameTokens(amount: number): Promise<boolean> {
    try {
      const csrfToken = localStorage.getItem("csrfToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/consume-token-24hrs`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken || "",
          },
          body: JSON.stringify({ cost: amount }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      console.log("consume-token-24hrs status:", res.status);
      console.log("consume-token-24hrs response:", data);

      if (!res.ok) return false;

      refreshSessions24hrs();
      return true;
    } catch (error) {
      console.error("Failed to spend tokens:", error);
      return false;
    }
  }

  return (
    <TicTacToe
      availableTokens={availableTokens}
      requiredTokens={GAME_COST}
      onSpendTokens={spendGameTokens}
    />
  );
}