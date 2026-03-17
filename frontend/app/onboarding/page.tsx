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

  if (!checkValue || checkValue < 1) {
    alert("Please enter a valid check-in interval");
    return;
  }

  if (!nickname.trim()) {
    alert("Nickname is required");
    return;
  }

  if (!selectedAvatar) {
    alert("Please select an avatar");
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

  let minutes = checkValue;
  if (checkUnit === "Hours") {
    minutes = checkValue * 60;
  }

  const favQuote = customQuote.trim() || selectedQuote.trim() || null;
  const trackMap: Record<string, number> = {
  sports: 1,
  games: 2,
  art: 3,
  pets: 4,
  space: 5,
  music: 6,
};

/*
const onboardSchema = Joi.object({
  nickname: Joi.string().max(15).allow(""),
  favQuote: Joi.string().max(500).optional().allow(""),
  avatarUrl: Joi.string().optional().allow("").max(500),
  checkInIntervalMinutes: Joi.number().integer().min(2).max(15),
  trackId: Joi.number().integer().required(),
});
*/
  const payload = {
    nickname: nickname.trim(),
    favQuote,
    avatarUrl: selectedAvatar,
    checkInIntervalMinutes: minutes,
    trackId: trackMap[selectedTrackId],
    //campus: campus.trim() || null,
    //course: course.trim() || null,
    //darkMode: on,
  };

  try {
    setLoading(true);
    const csrfToken = localStorage.getItem("csrfToken");

    console.log("ONBOARD PAYLOAD:", payload);
    console.log("CSRF TOKEN:", csrfToken);

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

    router.push("/dashboard");
  } catch (error) {
    console.error("Onboarding error:", error);
    alert("Something went wrong while saving onboarding.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center font-sans h-full">
      <main className="flex w-full h-[100%] flex-col items-center justify-between px-16 sm:items-start">
        <div className="pb-[3%]"></div>

        <div className="bg-[#ffd36b] rounded-sm w-full pl-7 pt-6">
          <b>ⓘ Welcome! This page helps you personalize your learning companion.</b>
          <p className="pl-10 pt-1">
            The choices you make here are used to customize reminders, motivation, and short activities while you study.
          </p>
          <p className="pl-11 pt-5"><b>• Campus & course (optional):</b> Help us understand how the app is being used.</p>
          <p className="pl-11"><b>• Check-in interval:</b> Choose how often the app checks in while you’re studying.</p>
          <p className="pl-11"><b>• Favorite quote:</b> Add your own motivational message, or choose one to see during study sessions.</p>
          <p className="pl-11"><b>• Nickname & avatar:</b> Personalize how the app refers to you.</p>
          <p className="pl-11"><b>• Fun preferences:</b> Select activities you enjoy—these may appear during breaks or pauses to help you reset and stay engaged.</p>
          <p className="pl-11"><b>• Settings can be changed later:</b> Nothing here is permanent.</p>
          <p className="pb-3 pl-1 pt-5">
            Look for ⓘ icons for quick explanations. Fields marked with{" "}
            <span className="text-[#ff0000]">*</span> are required.
          </p>
        </div>

        <p className="pt-4">This site uses cookies for the purpose of ad personalization</p>

        <div className="w-full pt-6 pb-[2%]">
          <button
            type="button"
            onClick={() => submitOnboarding(true)}
            disabled={loading}
            className="w-full rounded-lg py-6 text-white bg-[#235937] text-4xl font-semibold disabled:opacity-50"
          >
            Quick Start
          </button>
        </div>

        <div className="pt-3 flex gap-6">
          <div className="flex flex-col">
            <label htmlFor="campus" className="mb-1">Enter Campus (optional).</label>
            <input
              id="campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your campus (optional)."
            />
          </div>

          <div className="flex flex-col pl-[20%]">
            <label htmlFor="course" className="mb-1">Enter Course (optional).</label>
            <input
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your course (optional)."
            />
          </div>
        </div>

        <div className="pt-3">
          <label className="block mb-1" htmlFor="inputMins">
            Select a Check-in Interval.<span className="text-[#ff0000]">*</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              id="inputMins"
              type="number"
              min="1"
              step="1"
              value={checkValue}
              onChange={(e) => setCheckValue(Number(e.target.value))}
              className="w-20 border border-black bg-white rounded px-2 py-1"
            />

            <select
              value={checkUnit}
              onChange={(e) => setCheckUnit(e.target.value)}
              className="border border-black bg-white rounded px-2 py-1"
            >
              <option>Minutes</option>
              <option>Hours</option>
            </select>

            <span
              className="border border-black rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer"
              title="How often we check in with you."
            >
              i
            </span>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <label className="pt-4 flex" htmlFor="enterQuote">Type in your favorite quote.</label>
            <div>
              <input
                id="enterQuote"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                className="w-80 bg-white border border-black rounded p-2"
                placeholder="Type a quote (optional)."
              />
            </div>
          </div>

          <p className="pt-[7%]">OR</p>

          <div>
            <label className="pt-4 flex" htmlFor="selectQuote">Select a quote.</label>
            <div>
              <input
                id="selectQuote"
                value={selectedQuote}
                onChange={(e) => setSelectedQuote(e.target.value)}
                className="w-80 bg-white border border-black rounded p-2"
                placeholder="Select a quote (optional)."
              />
            </div>
          </div>
        </div>

        <div>
          <label className="pt-4 flex" htmlFor="nickname">
            Select a nickname.<span className="text-[#ff0000]">*</span>
          </label>
          <div className="flex">
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Enter a nickname."
            />
            <span className="pl-[10%] w-[35%]">Dark Mode</span>
            <div className="onoffswitch h-[1%] w-[1%]">
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

        <div className="flex flex-col">
          <div className="pt-[1%]"></div>
          <span>Select your avatar.<span className="text-[#ff0000]">*</span></span>

          <div className="grid grid-cols-6 gap-5 pt-[2%] w-full">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`flex justify-center rounded-full border-[7px] transition ${
                  selectedAvatar === avatar.id
                    ? "border-[#235937] scale-105"
                    : "border-transparent hover:border-[#235937]"
                }`}
              >
                <Image alt={avatar.alt} src={avatar.src} width={120} height={120} />
              </button>
            ))}
          </div>

          <div className="pt-[1%]"></div>
          <span>How do you like to have fun?<span className="text-[#ff0000]">*</span></span>

          <div className="grid grid-cols-6 gap-5 pt-[2%] w-full">
            {tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => 
                  setSelectedTrackId(track.id)}
                className={`flex justify-center rounded border-[3px] transition ${
                  selectedTrackId === track.id
                    ? "border-red-500 bg-[#90D5FF]"
                    : "border-transparent bg-transparent hover:bg-[#90D5FF]"
                }`}
              >
                <Image alt={track.alt} src={track.src} width={120} height={120} />
              </button>
            ))}
          </div>
        </div>

        <div className="w-full pt-6">
          <button
            type="button"
            onClick={() => submitOnboarding(false)}
            disabled={loading}
            className="w-full rounded-lg py-6 text-white bg-[#235937] text-4xl font-semibold disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </main>
    </div>
  );
}