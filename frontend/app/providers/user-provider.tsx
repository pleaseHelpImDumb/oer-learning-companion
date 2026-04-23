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

      if (!res.ok) {
        console.error("[USER PROVIDER] profile request failed:", data);
        return;
      }

      const user = data?.user;
      if (!user) {
        console.warn("[USER PROVIDER] No user object returned");
        return;
      }

      const normalizedTrack = normalizeTrack(user);
      if (normalizedTrack) {
        setTrack(normalizedTrack);
      }

      setAvatarUrl(getAvatarIdFromUrl(user?.avatarUrl));

      const name = user?.nickname || user?.displayName || user?.username;
      if (typeof name === "string" && name.trim() !== "") {
        setUsername(name);
      }

      const rawBadges = user?.userBadges ?? user?.badges;

      if (Array.isArray(rawBadges) && rawBadges.length > 0) {
        const newest = [...rawBadges].sort((a, b) => {
          const aTime = a?.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
          const bTime = b?.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
          return bTime - aTime;
        })[0]?.badge;

        if (
          newest &&
          typeof newest.emoji === "string" &&
          newest.emoji.trim() !== ""
        ) {
          setLatestBadge({
            emoji: newest.emoji,
            name:
              typeof newest.name === "string" && newest.name.trim() !== ""
                ? newest.name
                : "Latest Badge",
          });
        } else {
          setLatestBadge(null);
        }
      } else {
        setLatestBadge(null);
      }
    } catch (err) {
      console.error("[USER PROVIDER] User fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, [API_BASE_URL]);

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