"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function loginUser() {
  if (!API_BASE_URL) {
    alert("API not configured");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        identity,
        password,
      }),
    });

    const data = await res.json();

    if (res.status !== 200) {
      alert(data.error || data.message || "Login failed");
      return;
    }

    console.log("Login success:", data);
    window.location.href = "/onboarding";
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
        <a className="font-semibold text-[clamp(1rem,2vw,1.5rem)]">Log-in</a>
        <div className="pb-[6%]"></div>

        <div className="flex flex-col">
          <label htmlFor="identity" className="mb-1">Username/Email</label>
          <input
            id="identity"
            className="w-80 bg-white border border-black rounded p-2"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
        </div>

        <div className="pb-[4%]"></div>

        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1">Password</label>
          <input
            id="password"
            type="password"
            className="w-80 bg-white border border-black rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-center w-full pt-6 pb-[2%]">
          <button
            type="button"
            className="rounded-lg px-8 py-3 text-white bg-[#235937]"
            onClick={() => loginUser()}
          >
            Submit
          </button>
        </div>

        <div className="flex justify-center w-full pt-6">
          <Link href="forgor">
            <p className="text-[#0000FF]">Forgot your password?</p>
          </Link>
        </div>

        <div className="flex justify-center w-full pt-6 pb-[3%]">
          <Link href="register">
            <p className="text-[#0000FF]">Create an Account</p>
          </Link>
        </div>
      </div>
    </div>
  );
}