import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full h-[20%] bg-[#0E0C32] border-b border-black">
      <div className="grid grid-cols-3 items-center h-full px-4">

        {/* Left */}
        <div>
          <a className="text-white font-semibold">
            OER Learning Companion
          </a>
        </div>

        {/* Middle (optional content later) */}
        <div></div>

        {/* Right */}
        <div className="flex justify-end">
          <Link href="/settings">
            <Image
              src="/assets/profiles/profile0.png"
              alt="Profile Icon"
              width={40}
              height={40}
            />
          </Link>
        </div>

      </div>
    </header>
  );
}