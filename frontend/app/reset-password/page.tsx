"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!API_BASE_URL) {
      alert("API not configured");
      return;
    }

    if (!token) {
      alert("Missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords must match!");
      return;
    }

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

      const data = await res.json();

      if (res.status !== 200) {
        alert(data.error || data.message || "Failed to reset password");
        return;
      }

      console.log("Password reset success:", data);
      alert(data.message || "Password reset successful.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
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

      <div className="bg-white pl-[2%] pr-[2%] pt-[1%] rounded-xl shadow-lg">
        <div className="flex flex-row">
          <div>
            <Link href="/">
              <p className="text-[#808080]">&lt; back</p>
            </Link>
          </div>

          <div>
            <p className="pl-[5%] pb-[3%] font-semibold text-[clamp(1rem,2vw,1.5rem)]">
              Reset your Password
            </p>
            <p className="pl-[5%] pb-[3%]">
              Enter your new password below.
            </p>

            <form className="w-80" onSubmit={resetPassword}>
              <label htmlFor="new_password" className="mb-1 block">
                New Password
              </label>
              <input
                id="new_password"
                type="password"
                value={newPassword}
                className="w-full bg-white border border-black rounded p-2"
                onChange={(e) => setPassword(e.target.value)}
              />

              <label htmlFor="confirm_password" className="mb-1 block">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                className="w-full bg-white border border-black rounded p-2"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  className="rounded-lg py-3 text-white bg-[#235937] w-full"
                >
                  Reset Password
                </button>
              </div>
            </form>

            <div className="pb-[3%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}