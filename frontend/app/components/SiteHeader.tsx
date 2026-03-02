import Image from "next/image";
import Link from "next/link";
export default function SiteHeader() {
  return (
    <header className="w-full h-[20%] bg-[#fdf5e7] border-b border-black pb-[2%]">
        <h1 className="flex justify-center text-[#235937] font-semibold">
            OER Learning Companion
        </h1>
        <h1 className="pl-[2%] font-semibold text-7x">
          SUNY Oswego Study-Guide
        </h1>
    </header>
  );
}