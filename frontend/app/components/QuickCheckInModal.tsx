"use client";

import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (value: "up" | "down" | "skip") => void;
};

export default function QuickCheckInModal({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1c3d] px-10 py-8 text-center shadow-xl">

        {/* Top text */}
        <p className="text-sm text-gray-300 mb-2 font-bold">
          Quick Check-in (optional)
        </p>

        {/* Main question */}
        <h2 className="text-4xl font-semibold text-white mb-8">
          How’s it going?
        </h2>

        {/* Buttons row */}
        <div className="flex items-center justify-center gap-10">

          {/* Thumbs Down */}
          <button
            onClick={() => {
              onSelect?.("down");
              onClose();
            }}
            className="transition transform hover:scale-110"
          >
            <Image
              src="/Thumbs down.png"
              alt="Thumbs Down"
              width={60}
              height={60}
              className="opacity-80 hover:opacity-100"
            />
          </button>

          {/* Thumbs Up */}
          <button
            onClick={() => {
              onSelect?.("up");
              onClose();
            }}
            className="transition transform hover:scale-110"
          >
            <Image
              src="/Thumbs up.png"
              alt="Thumbs Up"
              width={60}
              height={60}
              className="opacity-80 hover:opacity-100"
            />
          </button>

          {/* Not now */}
          <button
            onClick={() => {
              onSelect?.("skip");
              onClose();
            }}
            className="rounded-full border border-green-400 px-6 py-2 text-green-400 transition hover:bg-green-400 hover:text-black"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}