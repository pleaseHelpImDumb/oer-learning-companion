'use client';

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [on, setOn] = useState(true);
  const [campus, setCampus] = useState("");
  const [course, setCourse] = useState("");
  const [checkValue, setCheckValue] = useState(5);
  const [checkUnit, setCheckUnit] = useState("Minutes");
  const [customQuote, setCustomQuote] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const avatars = [
    { id: "profile1", src: "/assets/profiles/profile1.png", alt: "Profile Option 1" },
    { id: "profile2", src: "/assets/profiles/profile2.png", alt: "Profile Option 2" },
    { id: "profile3", src: "/assets/profiles/profile3.png", alt: "Profile Option 3" },
    { id: "profile4", src: "/assets/profiles/profile4.png", alt: "Profile Option 4" },
    { id: "profile5", src: "/assets/profiles/profile5.png", alt: "Profile Option 5" },
    { id: "profile6", src: "/assets/profiles/profile6.png", alt: "Profile Option 6" },
  ];

  const tracks = [
    { id: "sports", src: "/assets/tracks/default/sports.png", alt: "Sports Track" },
    { id: "games", src: "/assets/tracks/default/games.png", alt: "Gaming Track" },
    { id: "art", src: "/assets/tracks/default/art.png", alt: "Art Track" },
    { id: "pets", src: "/assets/tracks/default/pets.png", alt: "Pets Track" },
    { id: "space", src: "/assets/tracks/default/space.png", alt: "Space Track" },
    { id: "music", src: "/assets/tracks/default/music.png", alt: "Music Track" },
  ];

async function submitOnboarding(quickstart: boolean) {
  if (!API_BASE_URL) {
    alert("API base URL is not configured");
    return;
  }

  if (!checkValue) {
    alert("Please enter a valid check-in interval");
    return;
  }

  let minutes = checkValue;
  if (checkUnit === "Hours") {
    minutes = checkValue * 60;
  }

  if (minutes < 2 || minutes > 15) {
    alert("Check-in interval must be between 2 and 15 minutes");
    return;
  }

  if (!selectedTrackId) {
    alert("Please select a fun track");
    return;
  }

  if (!quickstart) {
    if (!campus.trim()) {
      alert("Campus is required for full submit");
      return;
    }

    if (!course.trim()) {
      alert("Course is required for full submit");
      return;
    }

    if (!customQuote.trim() && !selectedQuote.trim()) {
      alert("Please either type a favorite quote or select one");
      return;
    }
  }

  const favQuote = customQuote.trim() || selectedQuote.trim() || "";
  const trackMap: Record<string, number> = {
    sports: 1,
    games: 2,
    art: 3,
    pets: 4,
    space: 5,
    music: 6,
  };

  const payload = {
    nickname: nickname.trim(),
    favQuote,
    avatarUrl: selectedAvatar || "",
    checkInIntervalMinutes: minutes,
    trackId: trackMap[selectedTrackId],
  };

  try {
    setLoading(true);
    const csrfToken = localStorage.getItem("csrfToken");

    const res = await fetch(`${API_BASE_URL}/users/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken || "",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log("ONBOARD STATUS:", res.status);
    console.log("ONBOARD RESPONSE:", data);

    if (!res.ok) {
      alert(data.error || data.message || "Onboarding failed");
      return;
    }

    // optional: use returned data
    console.log("Updated user:", data.user);
    console.log("Selected track:", data.selectedTrack);

    router.push("/dashboard");
  } catch (error) {
    console.error("Onboarding error:", error);
    alert("Something went wrong while saving onboarding.");
  } finally {
    setLoading(false);
  }
}
/**
 *   const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteQuote: favQuote,
        avatarUrl: avatarUrl,
        checkinIntervalMinutes: checkInIntervalMinutes,
        onboardingCompleted: true,
        nickname: nickname,
        trackId: trackId,
      },
    });

    return res.json({
      message: "Onboarding completed",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        favQuote: updatedUser.favQuote,
        avatarUrl: updatedUser.avatarUrl,
        checkInIntervalMinutes: updatedUser.checkInIntervalMinutes,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
      selectedTrack: {
        id: track.id,
        name: track.name,
        description: track.description,
      },
    });
 * 
 */
return (
  <div className="min-h-screen font-sans">
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-10">
      <div className="h-2 sm:h-4" />

      <div className="w-full rounded-sm bg-[#ffd36b] py-5 sm:px-6 sm:py-6">
        <b>ⓘ Welcome! This page helps you personalize your learning companion.</b>

        <p className="pt-2 text-sm sm:text-base">
          The choices you make here are used to customize reminders, motivation, and short activities while you study.
        </p>

        <p className="pt-4 text-sm sm:text-base">
          <b>• Campus & course (optional):</b> Help us understand how the app is being used.
        </p>
        <p className="text-sm sm:text-base">
          <b>• Check-in interval:</b> Choose how often the app checks in while you’re studying.
        </p>
        <p className="text-sm sm:text-base">
          <b>• Favorite quote:</b> Add your own motivational message, or choose one to see during study sessions.
        </p>
        <p className="text-sm sm:text-base">
          <b>• Nickname & avatar:</b> Personalize how the app refers to you.
        </p>
        <p className="text-sm sm:text-base">
          <b>• Fun preferences:</b> Select activities you enjoy—these may appear during breaks or pauses to help you reset and stay engaged.
        </p>
        <p className="text-sm sm:text-base">
          <b>• Settings can be changed later:</b> Nothing here is permanent.
        </p>

        <p className="pt-4 text-sm sm:text-base">
          Look for ⓘ icons for quick explanations. Fields marked with{" "}
          <span className="text-[#ff0000]">*</span> are required.
        </p>
      </div>

      <p className="pt-4 text-center text-sm sm:text-base">
        This site uses cookies for the purpose of ad personalization
      </p>

      <div className="w-full gap-3 pt-6 flex flex-row items-center">
        <button
          type="button"
          onClick={() => submitOnboarding(true)}
          disabled={loading}
          className="w-full flex-1 rounded-lg bg-[#235937] px-4 py-4 text-xl font-semibold text-white disabled:opacity-50 sm:py-5 sm:text-3xl"
        >
          Quick Start
        </button>
        <span
            className="flex shrink-0 h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-black text-xs"
            title="Get straight to studying with default settings.
            All settings can be changed later."
          >
            i
          </span>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 pt-6 md:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor="campus" className="mb-1 text-sm sm:text-base">
            Enter Campus (optional).
          </label>
          <input
            id="campus"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="w-full rounded border border-black bg-white p-2"
            placeholder="Please enter your campus (optional)."
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="course" className="mb-1 text-sm sm:text-base">
            Enter Course (optional).
          </label>
          <input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full rounded border border-black bg-white p-2"
            placeholder="Please enter your course (optional)."
          />
        </div>
      </div>

      <div className="pt-5">
        <label className="mb-2 block text-sm sm:text-base" htmlFor="inputMins">
          Select a Check-in Interval.<span className="text-[#ff0000]">*</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <input
            id="inputMins"
            type="number"
            min="1"
            step="1"
            value={checkValue}
            onChange={(e) => setCheckValue(Number(e.target.value))}
            className="w-24 rounded border border-black bg-white px-2 py-1"
          />

          <select
            value={checkUnit}
            onChange={(e) => setCheckUnit(e.target.value)}
            className="rounded border border-black bg-white px-2 py-1"
          >
            <option>Minutes</option>
            <option>Hours</option>
          </select>

          <span
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-black text-xs"
            title="How often would you like us to ask how you are doing?"
          >
            i
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 pt-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <div>
          <label className="mb-1 flex text-sm sm:text-base" htmlFor="enterQuote">
            Type in your favorite quote.
          </label>
          <input
            id="enterQuote"
            value={customQuote}
            onChange={(e) => setCustomQuote(e.target.value)}
            className="w-full rounded border border-black bg-white p-2"
            placeholder="Type a quote (optional)."
          />
        </div>

        <p className="text-center text-sm font-medium">OR</p>

        <div>
          <label className="mb-1 flex text-sm sm:text-base" htmlFor="selectQuote">
            Select a quote.
          </label>
          <input
            id="selectQuote"
            value={selectedQuote}
            onChange={(e) => setSelectedQuote(e.target.value)}
            className="w-full rounded border border-black bg-white p-2"
            placeholder="Select a quote (optional)."
          />
        </div>
      </div>

      <div className="pt-5">
        <label className="mb-2 block text-sm sm:text-base" htmlFor="nickname">
          Select a nickname.<span className="text-[#ff0000]">*</span>
        </label>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded border border-black bg-white p-2 md:max-w-md"
            placeholder="Enter a nickname."
          />

          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base">Dark Mode</span>
            <div className="onoffswitch">
              <input
                type="checkbox"
                name="onoffswitch"
                className="onoffswitch-checkbox"
                id="myonoffswitch"
                tabIndex={0}
                checked={on}
                onChange={(e) => setOn(e.target.checked)}
              />
              <label className="onoffswitch-label" htmlFor="myonoffswitch">
                <span className="onoffswitch-inner" />
                <span className="onoffswitch-switch" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col pt-5">
        <span className="text-sm sm:text-base">
          Select your avatar.<span className="text-[#ff0000]">*</span>
        </span>

        <div className="grid w-full grid-cols-2 gap-3 pt-3 sm:grid-cols-3 lg:grid-cols-6">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`flex justify-center rounded-full border-[5px] transition sm:border-[7px] ${
                selectedAvatar === avatar.id
                  ? "border-[#235937] scale-105"
                  : "border-transparent hover:border-[#235937]"
              }`}
            >
              <Image
                alt={avatar.alt}
                src={avatar.src}
                width={120}
                height={120}
                className="h-auto w-full max-w-[100px] sm:max-w-[120px]"
              />
            </button>
          ))}
        </div>

        <span className="pt-5 text-sm sm:text-base">
          How do you like to have fun?<span className="text-[#ff0000]">*</span>
        </span>

        <div className="grid w-full grid-cols-2 gap-3 pt-3 sm:grid-cols-3 lg:grid-cols-6">
          {tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setSelectedTrackId(track.id)}
              className={`flex justify-center rounded border-[3px] p-1 transition ${
                selectedTrackId === track.id
                  ? "border-red-500 bg-[#90D5FF]"
                  : "border-transparent bg-transparent hover:bg-[#90D5FF]"
              }`}
            >
              <Image
                alt={track.alt}
                src={track.src}
                width={120}
                height={120}
                className="h-auto w-full max-w-[100px] sm:max-w-[120px]"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full pt-6">
        <button
          type="button"
          onClick={() => submitOnboarding(false)}
          disabled={loading}
          className="w-full rounded-lg bg-[#235937] px-4 py-4 text-xl font-semibold text-white disabled:opacity-50 sm:py-5 sm:text-3xl"
        >
          Submit
        </button>
      </div>
    </main>
  </div>
);
}