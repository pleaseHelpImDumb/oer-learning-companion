"use client";

import { useEffect, useState } from "react";
import TicTacToe from "@/app/components/ticTacToe";

export default function TicTacToePage() {
  const [tokensAvailable, setTokensAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadSession() {
    try {
      const res = await fetch("http://localhost:3000/sessions/active", {
        credentials: "include",
      });

      const text = await res.text();
      console.log("sessions/active status:", res.status);
      console.log("sessions/active raw response:", text);

      if (!res.ok) {
        setTokensAvailable(0);
        return;
      }

      const data = JSON.parse(text);
      setTokensAvailable(Number(data?.session?.tokensAvailable ?? 0));
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
    const csrfToken = localStorage.getItem("csrfToken");

    const res = await fetch("http://localhost:3000/sessions/consume-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken || "",
      },
      body: JSON.stringify({ cost: amount }),
    });

    const text = await res.text();
    console.log("consume-token status:", res.status);
    console.log("consume-token raw response:", text);

    if (!res.ok) {
      return false;
    }

    const data = JSON.parse(text);
    setTokensAvailable(Number(data?.session?.tokensAvailable ?? 0));
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
      requiredTokens={4}
      onSpendTokens={spendGameTokens}
    />
  );
}