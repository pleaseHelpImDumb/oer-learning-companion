"use client";

import { useEffect, useState } from "react";
import TicTacToe from "@/app/components/ticTacToe";
import { useSession } from "@/app/providers/session-provider";
export default function TicTacToePage() {
  const { refreshSession } = useSession();
  const GAME_COST = 4;

  const [tokensAvailable, setTokensAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/active`,
          {
            credentials: "include",
          }
        );

        const text = await res.text();
        console.log("sessions/active status:", res.status);
        console.log("sessions/active raw response:", text);

        if (!res.ok) {
          setTokensAvailable(0);
          return;
        }

        const data = JSON.parse(text);
        setTokensAvailable(Number(data?.session?.tokensAvailable ?? 0));
        setSessionId(data?.session?.sessionId ?? null);
      } catch (error) {
        console.error("Failed to load session:", error);
        setTokensAvailable(0);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

async function spendGameTokens(amount: number): Promise<boolean> {
  try {
    if (!sessionId) return false;

    const csrfToken = localStorage.getItem("csrfToken");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/${sessionId}/consume-token`,
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
    console.log("consume-token status:", res.status);
    console.log("consume-token raw response:", text);

    if (!res.ok) {
      return false;
    }

    const data = JSON.parse(text);

    if (!data?.session) {
      return false;
    }

    setTokensAvailable(Number(data.session.tokensAvailable ?? 0));
    await refreshSession(); // <- add this
    return true;
  } catch (error) {
    console.error("Failed to spend tokens:", error);
    return false;
  }
}

  if (loading) {
    return (
      <div className="p-6 text-slate-900 dark:text-slate-100">
        Loading...
      </div>
    );
  }

  return (
    <TicTacToe
      availableTokens={tokensAvailable}
      requiredTokens={GAME_COST}
      onSpendTokens={spendGameTokens}
    />
  );
}