"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    if (!API_BASE_URL) {
      setStatus({
        type: "error",
        message: "API is not configured.",
      });
      return;
    }

    if (!token) {
      setStatus({
        type: "error",
        message: "This reset link is missing its token. Please request a new password reset link.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({
          type: "error",
          message:
            data.error ||
            data.message ||
            "Password reset failed. The link may be invalid or expired.",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          data.message ||
          "Password reset successful. You can now log in.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Could not reach the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold">Reset Password</h1>

        <p className="mb-4 text-sm text-gray-600">
          Enter your new password below.
        </p>

        {status && (
          <div
            className={`mb-4 rounded-md border px-3 py-2 text-sm ${
              status.type === "success"
                ? "border-green-600 bg-green-50 text-green-800"
                : "border-red-600 bg-red-50 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        {!token && (
          <div className="mb-4 rounded-md border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800">
            This reset link is missing its token. Please request a new one.
          </div>
        )}

        <form onSubmit={resetPassword}>
          <label htmlFor="newPassword" className="mb-1 block">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            required
            disabled={!token || isLoading}
            className="mb-3 w-full rounded border border-black p-2"
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label htmlFor="confirmPassword" className="mb-1 block">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            required
            disabled={!token || isLoading}
            className="mb-4 w-full rounded border border-black p-2"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={!token || isLoading}
            className="w-full rounded-lg bg-[#235937] py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        {status?.type === "success" && (
          <Link href="/" className="mt-4 block text-center text-sm underline">
            Go back to login
          </Link>
        )}
      </div>
    </div>
  );
}