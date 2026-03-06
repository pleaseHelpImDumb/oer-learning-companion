"use client";

import Image from "next/image";
import Link from "next/link";
import background from "assets/login_background.jpg";
import { useState } from "react";
export default function Home() {
    const[firstName,setFirstName] = useState("")
    const[lastName,setLastName] = useState("")
    const[email,setEmail] = useState("")
    const[password,setPassword] = useState("")
    const[confirmPassword,setConfirmPassword] = useState("")

    async function registerUser() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch("http://localhost:3000/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // important for the jwt cookie
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    console.log("Registered:", data);

    // redirect to next page
    window.location.href = "/timer";
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
            <p className=" pl-[5%] pb-[3%] font-semibold text-[clamp(1rem,2vw,1.5rem)]">Registration</p>
            <div className="flex flex-row gap-6">
                <div className="flex flex-col">
                    <label htmlFor="firstName" className="mb-1">First Name</label>
                    <input
                    id="firstName"
                    className="w-80 bg-white border border-black rounded p-2"
                    placeholder="firstName"
                    onChange={(e)=>setFirstName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="lastName" className="mb-1">Last Name</label>
                    <input
                    id="lastName"
                    className="w-80 bg-white border border-black rounded p-2"
                    placeholder="lastName"
                    onChange={(e)=>setLastName(e.target.value)}
                    />
                </div>
            </div>
            <div className="pt-[1%]">
                <div className="flex flex-col">
                    <label htmlFor="email" className="mb-1">Email</label>
                    <input
                    id="email"
                    className="w-full bg-white border border-black rounded p-2"
                    placeholder="email"
                    onChange={(e)=>setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-row gap-6 pt-[1%]">
                <div className="flex flex-col">
                    <label htmlFor="password" className="mb-1">Password</label>
                    <input
                    id="password"
                    className="w-80 bg-white border border-black rounded p-2"
                    placeholder="password"
                    onChange={(e)=>setPassword(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="confirmPassword" className="mb-1">Confirm Password</label>
                    <input
                    id="confirmPassword"
                    className="w-80 bg-white border border-black rounded p-2"
                    placeholder="confirm_password"
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center justify-center pt-[3%]">
                <Link href="login">
                    <button className="rounded-lg px-8 py-3 text-white bg-[#235937]" onClick={registerUser}>
                    Submit
                    </button>
                </Link>
            </div>
            <div className="pb-[3%]">

            </div>
        </div>
        </div>
      </div>

    </div>
  );
}