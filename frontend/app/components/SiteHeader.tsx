import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full bg-[#0E0C32] border-b border-black text-white">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3 gap-6">

        {/* LEFT: Title */}
        <div className="text-lg font-semibold whitespace-nowrap">
          OER Learning Companion
        </div>

        {/* CENTER: Stats */}
        <div className="flex items-center gap-8 flex-1 justify-center">

          {/* Modules */}
          <div className="flex items-center gap-2">
            <div className="bg-green-500 rounded px-2 font-bold text-lg">
              -
            </div>
            <span className="font-semibold">0 modules</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Image
              src="/timer.png"
              alt="Clock"
              width={32}
              height={32}
              className="bg-yellow-500 rounded-full p-1"
            />
            <span className="font-semibold">0:00:00</span>
          </div>

          {/* Goals */}
          <div className="flex items-center gap-3">
            <span className="font-semibold whitespace-nowrap">My Goals</span>
            <Image
              src="/assets/progress_header/sports/0.png"
              alt="Progress: 0%"
              width={160}
              height={32}
            />
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-3">
            <span className="font-semibold whitespace-nowrap">
              My Tokens
            </span>

            <div className="flex gap-1">
              <Image src="/assets/tokens/track/sports/track1.png" alt="Token" width={28} height={28}/>
              <Image src="/assets/tokens/track/sports/track2.png" alt="Token" width={28} height={28}/>
              <Image src="/assets/tokens/track/sports/track3.png" alt="Token" width={28} height={28}/>
              <Image src="/assets/tokens/track/sports/track4.png" alt="Token" width={28} height={28}/>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2">
            <Image
              src="/assets/badges/streak.png"
              alt="Study Streak Badge"
              width={28}
              height={28}
            />
            <span className="font-semibold whitespace-nowrap">
              5 day streak
            </span>
          </div>

        </div>

        {/* RIGHT: Profile */}
        <div className="flex items-center">
          <Link href="/settings">
            <Image
              src="/assets/profiles/profile0.png"
              alt="Profile Icon"
              width={40}
              height={40}
              className="rounded-full border border-white hover:scale-105 transition"
            />
          </Link>
        </div>

      </div>
    </header>
  );
}