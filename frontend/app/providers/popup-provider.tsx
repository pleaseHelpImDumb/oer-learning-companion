"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type PopupType =
  | "check-in"
  | "session-complete"
  | "encouragement"
  | "warning"
  | "achievement"
  | "settingsSaved";

type PopupTrack =
  | "Art"
  | "Gaming"
  | "Music"
  | "Pets"
  | "Space"
  | "Sports";

type PopupPayload = {
  id: string;
  type: PopupType;
  title?: string;
  message?: string;
  imageSrc?: string;
  trackName?: PopupTrack;
  autoCloseMs?: number;
};

type PopupContextType = {
  popup: PopupPayload | null;
  showPopup: (popup: Omit<PopupPayload, "id">) => void;
  closePopup: () => void;
};

const PopupContext = createContext<PopupContextType | null>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<PopupPayload | null>(null);

  const showPopup = (newPopup: Omit<PopupPayload, "id">) => {
    const popupWithId: PopupPayload = {
      ...newPopup,
      id: crypto.randomUUID(),
    };

    setPopup(popupWithId);

    if (newPopup.autoCloseMs && newPopup.autoCloseMs > 0) {
      window.setTimeout(() => {
        setPopup((current) =>
          current?.id === popupWithId.id ? null : current
        );
      }, newPopup.autoCloseMs);
    }
  };

  const closePopup = () => setPopup(null);

  const value = useMemo(
    () => ({
      popup,
      showPopup,
      closePopup,
    }),
    [popup]
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);

  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }

  return context;
}