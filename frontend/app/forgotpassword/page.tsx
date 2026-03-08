"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function sendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!API_BASE_URL) {
      alert("API not configured");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        alert(data.error || data.message || "Failed to send reset link");
        return;
      }

      console.log("Reset email success:", data);
      alert(data.message || "If that email exists, a reset link has been sent.");
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
              Forgot your Password?
            </p>
            <p className="pl-[5%] pb-[3%]">
              We'll email you a link to reset your password.
            </p>

            <form className="w-80" onSubmit={sendEmail}>
              <label htmlFor="email" className="mb-1 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                className="w-full bg-white border border-black rounded p-2"
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  className="rounded-lg py-3 text-white bg-[#235937] w-full"
                >
                  Send me a password reset link
                </button>
              </div>
            </form>

            <div className="pt-4">
              <Link href="/" className="block w-full pb-[2%]">
                <button
                  type="button"
                  className="rounded-lg py-3 text-[#000000] bg-[#b3b3b3] w-full"
                >
                  Cancel
                </button>
              </Link>
            </div>

            <div className="pb-[3%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}