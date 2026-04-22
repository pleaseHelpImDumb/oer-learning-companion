'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [on, setOn] = useState(true);
  const [campus, setCampus] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState(0);
  const [major, setMajor] = useState("");
  const [checkValue, setCheckValue] = useState(5);
  const [checkUnit, setCheckUnit] = useState("Minutes");
  const [customQuote, setCustomQuote] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
  const saved = localStorage.getItem("darkMode");
  if (saved === "true") {
    setDarkMode(true);
  }
}, []);
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  localStorage.setItem("darkMode", String(darkMode));
}, [darkMode]);
  const yearOptions = [
    { label: "Freshman", value: 1 },
    { label: "Sophomore", value: 2 },
    { label: "Junior", value: 3 },
    { label: "Senior", value: 4 },
  ];
  const avatars = [
    { id: "profile1", src: "/assets/profiles/profile1.png", alt: "Profile Option 1" },
    { id: "profile2", src: "/assets/profiles/profile2.png", alt: "Profile Option 2" },
    { id: "profile3", src: "/assets/profiles/profile3.png", alt: "Profile Option 3" },
    { id: "profile4", src: "/assets/profiles/profile4.png", alt: "Profile Option 4" },
    { id: "profile5", src: "/assets/profiles/profile5.png", alt: "Profile Option 5" },
    { id: "profile6", src: "/assets/profiles/profile6.png", alt: "Profile Option 6" },
  ];

    const avatars_selected = [
    { id: "profile1", src: "/assets/profiles_selected/profile1.png", alt: "Profile Option 1" },
    { id: "profile2", src: "/assets/profiles_selected/profile2.png", alt: "Profile Option 2" },
    { id: "profile3", src: "/assets/profiles_selected/profile3.png", alt: "Profile Option 3" },
    { id: "profile4", src: "/assets/profiles_selected/profile4.png", alt: "Profile Option 4" },
    { id: "profile5", src: "/assets/profiles_selected/profile5.png", alt: "Profile Option 5" },
    { id: "profile6", src: "/assets/profiles_selected/profile6.png", alt: "Profile Option 6" },
  ];

  const tracks = [
    { id: "sports", src: "/assets/tracks/default/sports.png", alt: "Sports Track" },
    { id: "games", src: "/assets/tracks/default/games.png", alt: "Gaming Track" },
    { id: "art", src: "/assets/tracks/default/art.png", alt: "Art Track" },
    { id: "pets", src: "/assets/tracks/default/pets.png", alt: "Pets Track" },
    { id: "space", src: "/assets/tracks/default/space.png", alt: "Space Track" },
    { id: "music", src: "/assets/tracks/default/music.png", alt: "Music Track" },
  ];
  const tracks_dark = [
    { id: "sports", src: "/assets/tracks/dark_mode/sports.png", alt: "Sports Track" },
    { id: "games", src: "/assets/tracks/dark_mode/games.png", alt: "Gaming Track" },
    { id: "art", src: "/assets/tracks/dark_mode/art.png", alt: "Art Track" },
    { id: "pets", src: "/assets/tracks/dark_mode/pets.png", alt: "Pets Track" },
    { id: "space", src: "/assets/tracks/dark_mode/space.png", alt: "Space Track" },
    { id: "music", src: "/assets/tracks/dark_mode/music.png", alt: "Music Track" },
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
      alert("Campus is required for full submit - quick fail");
      return;
    }

    if (!course.trim()) {
      alert("Course is required for full submit - quick fail");
      return;
    }

    if (!customQuote.trim() && !selectedQuote.trim()) {
      alert("Please either type a favorite quote or select one - quick fail");
      return;
    }
  }

  const favoriteQuote = customQuote.trim() || selectedQuote.trim() || "";
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
    favoriteQuote,
    avatarUrl: selectedAvatar || "",
    checkInIntervalMinutes: minutes,
    trackId: trackMap[selectedTrackId],
    yearLevel: year,
    major: major,
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
const selectClass =
  "w-full appearance-none rounded-md border border-[#c8c2b8] bg-white px-3 py-2 text-sm font-medium text-[#1f2937] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235937] dark:border-white/30 dark:bg-[#1b2740] dark:text-white dark:shadow-none dark:focus:ring-[#7cc46b]";

const inputClass =
  "w-full rounded-md border border-[#c8c2b8] bg-white px-3 py-2 text-sm text-[#1f2937] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235937] dark:border-white/30 dark:bg-transparent dark:text-white dark:shadow-none dark:focus:ring-[#7cc46b]";


const labelClass = "mb-1 text-sm font-medium text-[#235937] dark:text-white";
  const currentTracks = darkMode ? tracks_dark : tracks;
return (
  <div className="min-h-screen font-sans">
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-10">
      <div className="h-2 sm:h-4" />

      <div className="w-full rounded-sm bg-[#ffd36b] dark:bg-[#2E2A57] dark:text-[#ffffff] py-5 sm:px-6 sm:py-6">
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

      {/*<div className="w-full gap-3 pt-6 flex flex-row items-center">
        <button
          type="button"
          onClick={() => submitOnboarding(true)}
          disabled={loading}
          className="w-full flex-1 rounded-lg bg-[#235937] px-4 py-4 text-xl font-semibold text-white disabled:opacity-50 sm:py-5 sm:text-3xl"
        >
          Quick Start
        </button>
        <span
            className="flex shrink-0 h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-black text-xs dark:border-white"
            title="Get straight to studying with default settings.
            All settings can be changed later."
          >
            i
          </span>
      </div>*/}

      <div className="grid w-full grid-cols-1 gap-4 pt-6 md:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor="campus" className="mb-1 text-sm sm:text-base">
            Enter Campus (optional).
          </label>
          <input
            id="campus"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="w-full rounded border border-black bg-white p-2 dark:bg-[#2E2A57]"
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
            className="w-full rounded border border-black bg-white p-2 dark:bg-[#2E2A57]"
            placeholder="Please enter your course (optional)."
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 pt-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <div>
          <label className="mb-1 flex text-sm sm:text-base" htmlFor="enterQuote">
            Type in your favorite quote (optional).
          </label>
          <input
            id="enterQuote"
            value={customQuote}
            onChange={(e) => setCustomQuote(e.target.value)}
            className="w-full rounded border border-black bg-white p-2 dark:bg-[#2E2A57]"
            placeholder="Type a quote (optional)."
          />
        </div>

        <p className="text-center text-sm font-medium">OR</p>

        <div>
          <label className="mb-1 flex text-sm sm:text-base" htmlFor="selectQuote">
            Select a quote (optional).
          </label>

                <select
                  id="selectQuote"
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                <option value="You have to set goals that are almost out of reach. If you set a goal that is attainable without much work or thought, you are stuck with something below your true talent and potential.">You have to set goals that are almost out of reach. If you set a goal that is attainable without much work or thought, you are stuck with something below your true talent and potential.</option>
                <option value="Everything you want is on the other side of fear.">Everything you want is on the other side of fear.</option>
                <option value="Success is the sum of small efforts, repeated day in and day out">Success is the sum of small efforts, repeated day in and day out</option>
                <option value="Education is the passport to the future, for tomorrow belongs to those who prepare for it today.">Education is the passport to the future, for tomorrow belongs to those who prepare for it today.</option>
                <option value="Life is short. Stop worrying about what might happen. Live in the moment. Follow your heart. Be with good people. Forget what hurt you – but never forget what it taught you.">Life is short. Stop worrying about what might happen. Live in the moment. Follow your heart. Be with good people. Forget what hurt you – but never forget what it taught you.</option>
                <option value="Failure should be our teacher, not our undertaker. Failure is delay, not defeat. It is a temporary detour, not a dead end. Failure is something we can avoid only by saying nothing, doing nothing, and being nothing.">Failure should be our teacher, not our undertaker. Failure is delay, not defeat. It is a temporary detour, not a dead end. Failure is something we can avoid only by saying nothing, doing nothing, and being nothing.</option>
                <option value="If you can’t fly, run. If you can’t run, walk. If you can’t walk, crawl. But by all means, keep going.">If you can’t fly, run. If you can’t run, walk. If you can’t walk, crawl. But by all means, keep going.</option>
                <option value="What I've learned from running is that the time to push hard is when you're hurting like crazy and you want to give up. … Success is often just around the corner.">What I've learned from running is that the time to push hard is when you're hurting like crazy and you want to give up. … Success is often just around the corner.</option>
                <option value="Taking a new step, uttering a new word, is what people fear most.">Taking a new step, uttering a new word, is what people fear most.</option>
                <option value="I can see the sun, but even if I cannot see the sun, I know that it exists. And to know that the sun is there - that is living.">I can see the sun, but even if I cannot see the sun, I know that it exists. And to know that the sun is there - that is living.</option>
          </select>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 pt-6 md:grid-cols-2">

        <div className="flex flex-col">
          <label htmlFor="major" className="mb-1 text-sm sm:text-base">
            Enter Major.<span className="text-[#ff0000]">*</span>
          </label>
          <input
            id="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full rounded border border-black bg-white p-2 dark:bg-[#2E2A57]"
            placeholder="Please enter your course (optional)."
          />
        </div>
                <div className="flex flex-col">
          <label htmlFor="year" className="mb-1 text-sm sm:text-base">
            Enter Year.<span className="text-[#ff0000]">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3">
            {yearOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="year"
                  value={option.value}
                  checked={year === option.value}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-4 w-4 dark:accent-[#2E2A57]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
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
            className="w-24 rounded border border-black bg-white px-2 py-1 dark:bg-[#2E2A57]"
          />

          <select
            value={checkUnit}
            onChange={(e) => setCheckUnit(e.target.value)}
            className="rounded border border-black bg-white px-2 py-1 dark:bg-[#2E2A57]"
          >
            <option>Minutes</option>
            <option>Hours</option>
          </select>

          <span
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-black dark:border-white text-xs"
            title="How often would you like us to ask how you are doing?"
          >
            i
          </span>
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
            className="w-full rounded border border-black bg-white p-2 md:max-w-md dark:bg-[#2E2A57]"
            placeholder="Enter a nickname."
          />

          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base">Dark Mode</span>

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-pressed={darkMode}
              aria-label={darkMode ? "Turn dark mode off" : "Turn dark mode on"}
              className="relative h-8 w-16"
            >
              <Image
                src={darkMode ? "/dark_mode_on=true.png" : "/dark_mode_on=false.png"}
                alt={darkMode ? "Dark mode on" : "Dark mode off"}
                fill
                className="object-contain"
              />
            </button>
          </div>
        </div>
      </div>

          <div className="pt-2">
            <span className="text-sm font-medium text-[#235937] dark:text-white">
              Select your avatar.<span className="text-red-500">*</span>
            </span>

            <div className="grid w-full grid-cols-3 gap-4 pt-4 sm:grid-cols-4 lg:grid-cols-6">
              {avatars.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                const selectedVersion = avatars_selected.find((a) => a.id === avatar.id);
                const imgSrc = isSelected ? selectedVersion?.src || avatar.src : avatar.src;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`flex justify-center rounded-full transition-transform duration-150 ${
                      isSelected ? "scale-105" : "hover:scale-105"
                    }`}
                  >
                    <Image
                      alt={avatar.alt}
                      src={imgSrc}
                      width={96}
                      height={96}
                      className="h-auto w-full max-w-[78px] sm:max-w-[88px]"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-1">
            <span className="text-sm font-medium text-[#235937] dark:text-white">
              How do you like to have fun?<span className="text-red-500">*</span>
            </span>

            <div className="grid w-full grid-cols-3 gap-4 pt-4 sm:grid-cols-4 lg:grid-cols-6">
              {currentTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`flex flex-col items-center rounded-md px-1 py-2 transition ${
                    selectedTrackId === track.id
                      ? "bg-[#dff3e4] dark:bg-white/10"
                      : "hover:bg-[#edf7ef] dark:hover:bg-white/5"
                  }`}
                >
                  <Image
                    alt={track.alt}
                    src={track.src}
                    width={64}
                    height={64}
                    className="h-auto w-full max-w-[46px] sm:max-w-[56px]"
                  />
                </button>
              ))}
            </div>
          </div>

      <div className="w-full pt-6">
        <button
          type="button"
          onClick={() => submitOnboarding(true)}
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