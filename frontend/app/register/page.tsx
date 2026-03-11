"use client";

import { register } from "module";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function registerUser(e: React.FormEvent) {
    e.preventDefault();
    if (!API_BASE_URL) {
      alert("API base URL is not configured");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: `${firstName} ${lastName}`,
          email,
          password,
        }), 
      });

      const data = await res.json();

      if (res.status !== 201) {
        alert(data.error || data.message || "Registration failed");
        return;
      }

      console.log("Registered:", data);

      // only redirect on successful create
      window.location.href = "/";
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong while creating your account.");
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
              Registration
            </p>

            <form onSubmit={registerUser}>
<div className="flex flex-row gap-6">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="mb-1">First Name</label>
                <input
                  id="firstName"
                  className="w-80 bg-white border border-black rounded p-2"
                  placeholder="firstName"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="lastName" className="mb-1">Last Name</label>
                <input
                  id="lastName"
                  className="w-80 bg-white border border-black rounded p-2"
                  placeholder="lastName"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-[1%]">
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full bg-white border border-black rounded p-2"
                  placeholder="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row gap-6 pt-[1%]">
              <div className="flex flex-col">
                <label htmlFor="password" className="mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  className="w-80 bg-white border border-black rounded p-2"
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-80 bg-white border border-black rounded p-2"
                  placeholder="confirm_password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-center pt-[3%]">
              <button
                type="submit"
                className="rounded-lg px-8 py-3 text-white bg-[#235937]"
                onClick={registerUser}
              >
                Submit
              </button>
            </div>
            </form>

            <div className="pb-[3%]" />
          </div>
        </div>
      </div>
    </div>
  );
}