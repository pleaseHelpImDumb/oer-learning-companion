"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePopup } from "../providers/popup-provider";
export default function Home() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
type PopupTrack =
  | "Art"
  | "Gaming"
  | "Music"
  | "Pets"
  | "Space"
  | "Sports";

const [selectedTrackId, setSelectedTrackId] = useState<PopupTrack | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [course, setCourse] = useState("");
  const [campus, setCampus] = useState("");
  const [checkInInterval, setCheckInInterval] = useState("15 min");
  const [breakDuration, setBreakDuration] = useState("5 min");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [nickname, setNickname] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const [on, setOn] = useState(true);
  const [year, setYear] = useState(0);
  const [major, setMajor] = useState("");
  const [checkValue, setCheckValue] = useState(5);
  const [checkUnit, setCheckUnit] = useState("Minutes");
  const [customQuote, setCustomQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const yearOptions = [
    { label: "Freshman", value: 1 },
    { label: "Sophomore", value: 2 },
    { label: "Junior", value: 3 },
    { label: "Senior", value: 4 },
  ];
const [hydrated, setHydrated] = useState(false);
const { showPopup } = usePopup();
function getAvatarIdFromUrl(url: string | undefined | null) {
  if (!url) return "";

  const match = url.match(/(profile\d+)/);
  return match ? match[1] : "";
}
function setDarkModePreference(enabled: boolean) {
  const value = enabled ? "true" : "false";

  // localStorage (React usage)
  localStorage.setItem("darkMode", value);

  // cookie (early page load)
  document.cookie = `darkMode=${value}; path=/; max-age=31536000`; // 1 year

  // apply immediately
  document.documentElement.classList.toggle("dark", enabled);

  window.dispatchEvent(new Event("dark-mode-updated"));
}
function applyUserToForm(user: any) {
  // 🚫 Don't hydrate if critical data is missing
  if (!user) return;

  const hasTrack = user.track?.name;
  const hasAvatar = user.avatarUrl;

  if (!hasTrack || !hasAvatar) {
    console.log("⏳ Skipping hydration - incomplete user:", user);
    return;
  }

  if (hydrated) return;

  console.log("✅ Hydrating from DB:", user);

  setNickname(user.nickname || "");
  setFavoriteQuote(user.favoriteQuote || "");
  setSelectedAvatar(getAvatarIdFromUrl(user.avatarUrl));

  setSelectedTrackId(user.track.name);

  setCheckInInterval(
    user.checkinIntervalMinutes
      ? `${user.checkinIntervalMinutes} min`
      : "15 min"
  );

  setYear(typeof user.yearLevel === "number" ? user.yearLevel : 0);
  setMajor(typeof user.major === "string" ? user.major : "");

  setHydrated(true);
}
async function submitOnboarding() {
  if (!API_BASE_URL) {
    alert("API base URL is not configured");
    return;
  }

  if (!selectedTrackId) {
    alert("Please select a fun track");
    return;
  }

  if (!selectedAvatar) {
    alert("Please select an avatar");
    return;
  }

const trackMap: Record<string, number> = {
  Sports: 1,
  Gaming: 2,
  Art: 3,
  Pets: 4,
  Space: 5,
  Music: 6,
};

const mappedTrackId = trackMap[selectedTrackId];

if (!mappedTrackId) {
  alert("Please select a valid fun track");
  return;
}

const avatarMatch = avatars.find((a) => a.id === selectedAvatar);
const avatarUrl = avatarMatch?.src || "";

const checkInMinutes = parseInt(checkInInterval, 10);
const finalQuote = favoriteQuote.trim() || selectedQuote.trim() || "";

const payload = {
  nickname: nickname.trim(),
  favoriteQuote: finalQuote,
  avatarUrl,
  checkInIntervalMinutes: Number.isNaN(checkInMinutes) ? 15 : checkInMinutes,
  trackId: mappedTrackId,
  yearLevel: year || undefined,
  major: major.trim() || undefined,
};

  try {
    setLoading(true);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(`${API_BASE_URL}/users/onboard`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    console.log("ONBOARD STATUS:", res.status);
    console.log("ONBOARD RESPONSE:", data);

if (!res.ok) {
  alert(data.error || data.message || "Failed to save settings");
  return;
}

localStorage.setItem("selectedTrackName", selectedTrackId || "");
window.dispatchEvent(new Event("track-updated"));
window.dispatchEvent(
  new CustomEvent("profile-updated", {
    detail: {
      track: selectedTrackId,
      avatarUrl,
      username: nickname.trim(),
    },
  })
);

showPopup({
  type: "settingsSaved",
  trackName: selectedTrackId,
  message: "Your changes have been successfully made.",
  autoCloseMs: 2500,
});
  } catch (error) {
    console.error("Onboarding/settings save error:", error);
    alert("Something went wrong while saving settings.");
  } finally {
    setLoading(false);
  }
}
async function loadProfile() {
  if (!API_BASE_URL) {
    setLoadingProfile(false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to load profile");
    }

    const data = await res.json();
    const user = data.user || data;
    console.log("PROFILE RESPONSE:", user);
    applyUserToForm(user);
  } catch (err) {
    console.error("Failed to load profile:", err);
  } finally {
    setLoadingProfile(false);
  }
}
useEffect(() => {
  void loadProfile();
}, [API_BASE_URL]);
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

  const avatars_hovered = [
    { id: "profile1", src: "/assets/profiles_hovered/profile1.png", alt: "Profile Option 1" },
    { id: "profile2", src: "/assets/profiles_hovered/profile2.png", alt: "Profile Option 2" },
    { id: "profile3", src: "/assets/profiles_hovered/profile3.png", alt: "Profile Option 3" },
    { id: "profile4", src: "/assets/profiles_hovered/profile4.png", alt: "Profile Option 4" },
    { id: "profile5", src: "/assets/profiles_hovered/profile5.png", alt: "Profile Option 5" },
    { id: "profile6", src: "/assets/profiles_hovered/profile6.png", alt: "Profile Option 6" },
  ];

const tracks: { id: PopupTrack; src: string; alt: string }[] = [
  { id: "Sports", src: "/assets/tracks/default/sports.png", alt: "Sports Track" },
  { id: "Gaming", src: "/assets/tracks/default/games.png", alt: "Gaming Track" },
  { id: "Art", src: "/assets/tracks/default/art.png", alt: "Art Track" },
  { id: "Pets", src: "/assets/tracks/default/pets.png", alt: "Pets Track" },
  { id: "Space", src: "/assets/tracks/default/space.png", alt: "Space Track" },
  { id: "Music", src: "/assets/tracks/default/music.png", alt: "Music Track" },
];

const tracks_dark: { id: PopupTrack; src: string; alt: string }[] = [
  { id: "Sports", src: "/assets/tracks/dark_mode/sports.png", alt: "Sports Track" },
  { id: "Gaming", src: "/assets/tracks/dark_mode/games.png", alt: "Gaming Track" },
  { id: "Art", src: "/assets/tracks/dark_mode/art.png", alt: "Art Track" },
  { id: "Pets", src: "/assets/tracks/dark_mode/pets.png", alt: "Pets Track" },
  { id: "Space", src: "/assets/tracks/dark_mode/space.png", alt: "Space Track" },
  { id: "Music", src: "/assets/tracks/dark_mode/music.png", alt: "Music Track" },
];

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
    document.cookie = `darkMode=${darkMode}; path=/; max-age=31536000`;
  }, [darkMode]);

const selectClass =
  "w-full appearance-none rounded-md border border-[#c8c2b8] bg-white px-3 py-2 text-sm font-medium text-[#1f2937] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235937] dark:border-white/30 dark:bg-[#1b2740] dark:text-white dark:shadow-none dark:focus:ring-[#7cc46b]";

const inputClass =
  "w-full rounded-md border border-[#c8c2b8] bg-white px-3 py-2 text-sm text-[#1f2937] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235937] dark:border-white/30 dark:bg-transparent dark:text-white dark:shadow-none dark:focus:ring-[#7cc46b]";


const labelClass = "mb-1 text-sm font-medium text-[#235937] dark:text-white";
  const currentTracks = darkMode ? tracks_dark : tracks;

return (
  <div className="min-h-screen font-sans bg-[#F5F1E8] text-[#1f2937] dark:bg-[#06153a] dark:text-white">
    <div className="border-b border-black/10 bg-[#235937] px-4 py-3 sm:px-6 dark:border-white/20 dark:bg-transparent">
      <p className="text-3xl font-bold text-white dark:text-white/90">Settings</p>
    </div>

    <div className="border-b border-black/10 dark:border-white/20">
      <div className="flex items-center gap-8 overflow-x-auto px-4 sm:px-6">
        {/*<Link href="/settings" className="py-3 text-sm font-medium whitespace-nowrap">*/}
          <span
            className={`inline-block pb-2 ${
              pathname === "/settings"
                ? "border-b-2 border-[#235937] text-[#235937] dark:border-[#7cc46b] dark:text-[#7cc46b]"
                : "text-[#235937]/80 hover:text-[#235937] dark:text-white/80 dark:hover:text-white"
            }`}
          >
            General
          </span>
        {/*</Link>*/}

        {/*<Link href="/sesshistory" className="py-3 text-sm font-medium whitespace-nowrap">*/}
          <span
            className={`inline-block pb-2 ${
              pathname === "/sesshistory"
                ? "border-b-2 border-[#235937] text-[#235937] dark:border-[#7cc46b] dark:text-[#7cc46b]"
                : "text-[#235937]/80 hover:text-[#235937] dark:text-white/80 dark:hover:text-white"
            }`}
          >
            Session History
          </span>
        {/*</Link>*/}

        {/*<Link href="/badgecollection" className="py-3 text-sm font-medium whitespace-nowrap">*/}
          <span
            className={`inline-block pb-2 ${
              pathname === "/badgecollection"
                ? "border-b-2 border-[#235937] text-[#235937] dark:border-[#7cc46b] dark:text-[#7cc46b]"
                : "text-[#235937]/80 hover:text-[#235937] dark:text-white/80 dark:hover:text-white"
            }`}
          >
            Badge Collection
          </span>
        {/*</Link>*/}
      </div>
    </div>

    <div className="w-full max-w-[1180px] px-4 py-5 sm:px-6">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div className="flex flex-col">
            <label htmlFor="course" className={labelClass}>
              Enter course (optional).
            </label>
            <input
              id="course"
              className={inputClass}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="campus" className={labelClass}>
              Enter campus (optional).
            </label>
            <input
              id="campus"
              className={inputClass}
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm font-medium text-[#235937] dark:text-white">
              Dark Theme
            </span>
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-pressed={darkMode}
              aria-label={darkMode ? "Turn dark mode off" : "Turn dark mode on"}
              className="relative h-7 w-14 shrink-0"
            >
              <Image
                src={darkMode ? "/dark_mode_on=true.png" : "/dark_mode_on=false.png"}
                alt={darkMode ? "Dark mode on" : "Dark mode off"}
                fill
                className="object-contain"
              />
            </button>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Select a check-in interval.*</label>
            <select
              value={checkInInterval}
              onChange={(e) => setCheckInInterval(e.target.value)}
              className={selectClass}
            >
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="45 min">45 min</option>
              <option value="60 min">60 min</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Select a break duration.*</label>
            <select
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
              className={selectClass}
            >
              <option value="5 min">5 min</option>
              <option value="10 min">10 min</option>
              <option value="15 min">15 min</option>
              <option value="20 min">20 min</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div className="flex flex-col">
            <label htmlFor="favorite-quote" className={labelClass}>
              Type in your favorite quote.
            </label>
            <input
              id="favorite-quote"
              className={inputClass}
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center py-1 text-sm font-medium text-[#6f665c] dark:text-white/50 md:pb-2">
            OR
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Select a quote</label>
            <select
              value={selectedQuote}
              onChange={(e) => setSelectedQuote(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose a quote</option>
              <option value="quote1">Quote 1</option>
              <option value="quote2">Quote 2</option>
              <option value="quote3">Quote 3</option>
            </select>
          </div>
        </div>

        <div className="max-w-md">
          <div className="flex flex-col">
            <label htmlFor="nickname" className={labelClass}>
              Select a nickname.
            </label>
            <input
              id="nickname"
              className={inputClass}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
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
        </div>
        <div className="pt-2">
          <span className="text-sm font-medium text-[#235937] dark:text-white">
            Select your avatar.<span className="text-red-500">*</span>
          </span>

          <div className="grid w-full grid-cols-3 gap-4 pt-4 sm:grid-cols-4 lg:grid-cols-6">
            {avatars.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              const isHovered = hoveredAvatar === avatar.id;

              const selectedVersion = avatars_selected.find((a) => a.id === avatar.id);
              const hoveredVersion = avatars_hovered.find((a) => a.id === avatar.id);

              let imgSrc = avatar.src;
              if (isSelected) {
                imgSrc = selectedVersion?.src || avatar.src;
              } else if (isHovered) {
                imgSrc = hoveredVersion?.src || avatar.src;
              }

              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  onMouseEnter={() => setHoveredAvatar(avatar.id)}
                  onMouseLeave={() => setHoveredAvatar(null)}
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

        <div className="flex justify-center gap-3 pt-8">
          <button
            type="button"
            className="min-w-[170px] rounded-md bg-[#235937] px-8 py-3 text-2xl font-semibold text-white transition hover:brightness-105 dark:bg-[#7cc46b] dark:text-[#0b1633]"
            onClick={submitOnboarding}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            className="min-w-[170px] rounded-md bg-[#d6cec2] px-8 py-3 text-2xl font-semibold text-[#235937] transition hover:brightness-105 dark:bg-[#bfbfbf] dark:text-[#0b1633]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);
}