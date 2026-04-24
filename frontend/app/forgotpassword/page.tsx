"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Status = {
  type: "success" | "error" | "info";
  message: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function sendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    if (!API_BASE_URL) {
      setStatus({
        type: "error",
        message: "The API URL is not configured. Please check your frontend environment file.",
      });
      return;
    }

    if (!email.trim()) {
      setStatus({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      let data: any = {};
      const text = await res.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }

      if (!res.ok) {
        setStatus({
          type: "error",
          message:
            data.error ||
            data.message ||
            "We could not send the reset link. Please try again.",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          data.message ||
          "If an account exists for that email, a password reset link has been sent.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message:
          "We could not reach the server. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center font-sans">
      <Image
        src="/login_background.jpg"
        alt="Background"
        fill
        className="object-cover -z-10"
      />

      <div className="rounded-xl bg-white px-8 py-6 shadow-lg">
        <div className="flex flex-row gap-6">
          <div>
            <Link href="/">
              <p className="text-[#808080]">&lt; back</p>
            </Link>
          </div>

          <div className="w-80">
            <p className="pb-3 font-semibold text-[clamp(1rem,2vw,1.5rem)]">
              Forgot your Password?
            </p>

            <p className="pb-4 text-sm text-gray-700">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {status && (
              <div
                className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                  status.type === "success"
                    ? "border-green-600 bg-green-50 text-green-800"
                    : status.type === "error"
                      ? "border-red-600 bg-red-50 text-red-800"
                      : "border-blue-600 bg-blue-50 text-blue-800"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={sendEmail}>
              <label htmlFor="email" className="mb-1 block">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                required
                className="w-full rounded border border-black bg-white p-2"
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-[#235937] py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Sending reset link..." : "Send me a password reset link"}
                </button>
              </div>
            </form>

            <div className="pt-4">
              <Link href="/" className="block w-full">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#b3b3b3] py-3 text-black"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}