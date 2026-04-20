"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <li
      className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-gray-400"}`}
    >
      <span>{met ? "✓" : "○"}</span>
      {text}
    </li>
  );
}

function SuccessModal({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-xl shadow-xl px-10 py-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          Account Created!
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Your account has been successfully created. You can now log in.
        </p>

        <button
          onClick={onContinue}
          className="mt-2 rounded-lg px-8 py-2.5 text-white bg-[#235937] hover:bg-[#1a4229] transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Username requirements
  const usernameMinLength = userName.length >= 2;
  const usernameMaxLength = userName.length <= 50;
  const usernameValid = usernameMinLength && usernameMaxLength;

  // Password requirements
  const passwordMinLength = password.length >= 8;
  const passwordHasNumber = /\d/.test(password);
  const passwordHasSymbol = /[^a-zA-Z0-9]/.test(password);
  const passwordValid =
    passwordMinLength && passwordHasNumber && passwordHasSymbol;

  async function registerUser(e: React.FormEvent) {
    e.preventDefault();
    if (!API_BASE_URL) {
      alert("API base URL is not configured");
      return;
    }

    if (!usernameValid) {
      alert("Username must be between 2 and 50 characters");
      return;
    }

    if (!passwordValid) {
      alert("Password does not meet requirements");
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
          username: `${userName}`,
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
      setShowSuccessModal(true); // show modal instead of immediately redirecting
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

      {showSuccessModal && (
        <SuccessModal onContinue={() => (window.location.href = "/")} />
      )}

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
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <label htmlFor="username" className="mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    className="w-full bg-white border border-black rounded p-2"
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  {userName.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      <RequirementItem
                        met={usernameMinLength}
                        text="At least 2 characters"
                      />
                      <RequirementItem
                        met={usernameMaxLength}
                        text="No more than 50 characters"
                      />
                    </ul>
                  )}
                </div>
              </div>

              <div className="pt-[1%]">
                <div className="flex flex-col">
                  <label htmlFor="email" className="mb-1">
                    Email
                  </label>
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
                  <label htmlFor="password" className="mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-80 bg-white border border-black rounded p-2"
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      <RequirementItem
                        met={passwordMinLength}
                        text="At least 8 characters"
                      />
                      <RequirementItem
                        met={passwordHasNumber}
                        text="At least 1 number"
                      />
                      <RequirementItem
                        met={passwordHasSymbol}
                        text="At least 1 symbol"
                      />
                    </ul>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="confirmPassword" className="mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-80 bg-white border border-black rounded p-2"
                    placeholder="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      <RequirementItem
                        met={password === confirmPassword}
                        text="Passwords match"
                      />
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center pt-[3%]">
                <button
                  type="submit"
                  className="rounded-lg px-8 py-3 text-white bg-[#235937] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !usernameValid ||
                    !passwordValid ||
                    password !== confirmPassword
                  }
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
