"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type TrackName = "Art" | "Gaming" | "Music" | "Pets" | "Space" | "Sports";

type LatestBadge = {
  emoji: string;
  name: string;
} | null;

type UserContextType = {
  track: TrackName | null;
  avatarUrl: string;
  username: string;
  latestBadge: LatestBadge;
  loading: boolean;
  refreshUser: () => Promise<void>;
};
type CachedUserProfile = {
  track: TrackName | null;
  avatarUrl: string;
  username: string;
  latestBadge: LatestBadge;
};
type UserProviderProps = {
  children: React.ReactNode;
};

const TRACKS = {
  Art: ["🎨", "🖋️", "🖼️", "🧑‍🎨"],
  Gaming: ["🕹️", "🎮", "🎲", "♟️"],
  Music: ["🎧", "🎺", "🎸", "🥁"],
  Pets: ["🐶", "🐱", "🐹", "🐰"],
  Space: ["🚀", "🌕", "☄️", "👾"],
  Sports: ["🏀", "⚽", "⚾", "🏈"],
} as const;

const TRACK_ID_TO_NAME: Record<number, TrackName> = {
  1: "Sports",
  2: "Gaming",
  3: "Art",
  4: "Pets",
  5: "Space",
  6: "Music",
};

const UserContext = createContext<UserContextType | null>(null);
function getAvatarIdFromUrl(url: string | undefined | null) {
  if (!url) return "profile0";
  const match = url.match(/(profile\d+)/);
  return match ? match[1] : "profile0";
}

function normalizeTrack(user: any): TrackName | null {
  const rawTrack = user?.track;

  if (typeof rawTrack === "string" && rawTrack in TRACKS) {
    return rawTrack as TrackName;
  }

  if (
    rawTrack &&
    typeof rawTrack === "object" &&
    typeof rawTrack.name === "string" &&
    rawTrack.name in TRACKS
  ) {
    return rawTrack.name as TrackName;
  }

  if (typeof user?.trackId === "number" && TRACK_ID_TO_NAME[user.trackId]) {
    return TRACK_ID_TO_NAME[user.trackId];
  }

  const joinedTrackName = user?.userTracks?.[0]?.hobbyTrack?.name;
  if (typeof joinedTrackName === "string" && joinedTrackName in TRACKS) {
    return joinedTrackName as TrackName;
  }

  return null;
}

export function UserProvider({ children }: UserProviderProps) {
  const USER_CACHE_KEY = "oer_user_profile_cache";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [track, setTrack] = useState<TrackName | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("profile0");
  const [username, setUsername] = useState("username");
  const [latestBadge, setLatestBadge] = useState<LatestBadge>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
 
    if (!API_BASE_URL) {
      console.error("[USER PROVIDER] NEXT_PUBLIC_API_BASE_URL is not set");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      console.log("[USER PROVIDER] profile response:", data);

if (res.status === 429) {
  console.warn("[USER PROVIDER] profile rate-limited; using cached user");
  loadCachedUser();
  return;
}

if (!res.ok) {
  console.warn("[USER PROVIDER] profile request failed:", {
    status: res.status,
    data,
  });

  loadCachedUser();
  return;
}
console.log("[USER PROVIDER] profile status:", res.status);
const user = data?.user;
const normalizedTrack = normalizeTrack(user);
const nextAvatarUrl = getAvatarIdFromUrl(user?.avatarUrl);

const name = user?.nickname || user?.displayName || user?.username;
const nextUsername =
  typeof name === "string" && name.trim() !== ""
    ? name
    : "username";

let nextLatestBadge: LatestBadge = null;

const rawBadges = user?.userBadges ?? user?.badges;

if (Array.isArray(rawBadges) && rawBadges.length > 0) {
  const newestEntry = [...rawBadges].sort((a, b) => {
    const aTime = a?.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
    const bTime = b?.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
    return bTime - aTime;
  })[0];

  const newest = newestEntry?.badge ?? newestEntry;

  if (newest && typeof newest.name === "string") {
    nextLatestBadge = {
      emoji:
        typeof newest.emoji === "string" && newest.emoji.trim() !== ""
          ? newest.emoji
          : "🏅",
      name: newest.name.trim() || "Latest Badge",
    };
  }
}

const nextProfile: CachedUserProfile = {
  track: normalizedTrack,
  avatarUrl: nextAvatarUrl,
  username: nextUsername,
  latestBadge: nextLatestBadge,
};

applyCachedUser(nextProfile);
saveCachedUser(nextProfile);
    } catch (err) {
      console.error("[USER PROVIDER] User fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };
function applyCachedUser(cached: CachedUserProfile) {
  setTrack(cached.track);
  setAvatarUrl(cached.avatarUrl);
  setUsername(cached.username);
  setLatestBadge(cached.latestBadge);
}

function loadCachedUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return;

    const cached = JSON.parse(raw) as CachedUserProfile;
    applyCachedUser(cached);
  } catch (err) {
    console.warn("[USER PROVIDER] Failed to load cached user:", err);
  }
}

function saveCachedUser(cached: CachedUserProfile) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cached));
  } catch (err) {
    console.warn("[USER PROVIDER] Failed to save cached user:", err);
  }
}
  useEffect(() => {
    void refreshUser();
  }, [API_BASE_URL]);
useEffect(() => {
  loadCachedUser();
}, []);
  const value = useMemo<UserContextType>(
    () => ({
      track,
      avatarUrl,
      username,
      latestBadge,
      loading,
      refreshUser,
    }),
    [track, avatarUrl, username, latestBadge, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return ctx;
}