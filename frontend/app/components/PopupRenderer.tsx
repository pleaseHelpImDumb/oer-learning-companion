"use client";

import { usePopup } from "../providers/popup-provider";

const TRACK_POPUP_IMAGES: Record<string, string> = {
  art: "/changes/art.png",
  gaming: "/changes/gaming.png",
  music: "/changes/music.png",
  pets: "/changes/pets.png",
  space: "/changes/space.png",
  sports: "/changes/sports.png",
};

function getPopupImage(popup: {
  imageSrc?: string;
  trackName?: string;
}) {
  if (popup.imageSrc) return popup.imageSrc;

  if (popup.trackName) {
    const key = popup.trackName.toLowerCase();
    return TRACK_POPUP_IMAGES[key] || null;
  }

  return null;
}

export default function PopupRenderer() {
  const { popup, closePopup } = usePopup();

  if (!popup) return null;

  const resolvedImage = getPopupImage(popup);
  const backgroundClass = popup.dimBackground ? "bg-black/30" : "bg-transparent";

  if (popup.type === "sessionCelebration") {
    return (
      <div className="fixed inset-0 z-[9999] overflow-hidden">
        {popup.gifSrc && (
          <img
            src={popup.gifSrc}
            alt={popup.title || "Celebration effect"}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none">
          {resolvedImage && (
            <img
              src={resolvedImage}
              alt={popup.title || "Session complete"}
              className="w-full max-w-[900px] h-auto object-contain"
            />
          )}
        </div>

        <button
          type="button"
          onClick={closePopup}
          className="absolute top-4 right-4 z-[10000] rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white hover:bg-black/75"
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none ${backgroundClass}`}
    >
      {popup.gifSrc ? (
        <img
          src={popup.gifSrc}
          alt={popup.title || "Celebration effect"}
          className="h-full w-full object-cover"
        />
      ) : resolvedImage ? (
        <div className="relative flex items-center justify-center">
          <img
            src={resolvedImage}
            alt={popup.title || "Popup visual"}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          {popup.message && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <p
                className="
                  text-white
                  text-center
                  font-bold
                  text-[clamp(32px,5.5vw,70px)]
                  leading-[clamp(40px,6.5vw,80px)]
                  [-webkit-text-stroke:4px_#006AFF]
                  [text-shadow:0_4px_10px_rgba(0,0,0,0.5)]
                "
              >
                {popup.message}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}