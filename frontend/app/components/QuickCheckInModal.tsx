"use client";

import Image from "next/image";
import { useCheckIn } from "@/app/providers/checkin-provider";
type Props = {
  open: boolean;
  onClose: () => void;
  warning?: string | null;
  onSelect?: (value: "up" | "down" | "skip") => void;
};

export default function QuickCheckInModal({
  open,
  onClose,
  warning,
  onSelect,
}: Props) {  const { checkInOpen, setCheckInOpen, submitCheckIn } = useCheckIn();
  if (!checkInOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1c3d] px-10 py-8 text-center shadow-xl">
<button
  onClick={() => {
    setCheckInOpen(false);
    onClose();
  }}
  aria-label="Close check-in"
  className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
>
  ×
</button>
        {/* Top text */}
        <p className="text-sm text-gray-300 mb-2 font-bold">
          Quick Check-in
        </p>
{warning && (
  <p className="mb-6 rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-200">
    {warning}
  </p>
)}
        {/* Main question */}
        <h2 className="text-4xl font-semibold text-white mb-8">
          How’s it going?
        </h2>

        {/* Buttons row */}
        <div className="flex items-center justify-center gap-10">

          {/* Thumbs Down */}
<button
  onClick={() => {
    localStorage.setItem("freeGameTokens", "4");

    setCheckInOpen(false); // close quick check-in modal

    onSelect?.("down"); // open stuck modal upstream
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
onClick={async () => {
await submitCheckIn("up", "None");
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
          {/*<button
            onClick={() => {
              onSelect?.("skip");
            }}
            className="rounded-full border border-green-400 px-6 py-2 text-green-400 transition hover:bg-green-400 hover:text-black"
          >
            Not now
          </button>*/}
        </div>
      </div>
    </div>
  );
}