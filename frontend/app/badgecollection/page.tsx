import Image from "next/image";
import Link from "next/link";
import background from "assets/login_background.jpg";
export default function Home() {
  return (
    <div className="relative flex flex-col justify-center font-sans">
        <div className="p-[1%] border-b-1 bg-[#235937]">
            <p className="font-8xl font-bold text-white">Settings</p>
        </div>

        <div className="border-black border-b-1 flex flex-row gap-20 items-center">
          <div>
            <Link href="/settings">
            <button className="border-5 py-3 border-transparent hover:border-b-[#235937] w-30">
              <p className="font-8xl font-bold">General</p>
            </button>
            </Link>
          </div>
          <div className="flex flex-col justify-center self-stretch">
                <div className="w-px h-[70%] bg-gray-400 rounded-full"></div>
            </div>
          <Link href="/sesshistory">
          <button className="border-5 py-3 border-transparent hover:border-b-[#235937] w-57">
            <p className="font-8xl font-bold">Session History</p>
          </button>
          </Link>
          <div className="flex flex-col justify-center self-stretch">
                <div className="w-px h-[70%] bg-gray-400 rounded-full"></div>
            </div>
          <Link href="/badgecollection">
          <button className="border-5 py-3 border-transparent hover:border-b-[#235937] w-65">
            <p className="font-8xl font-bold">Badge Collection</p>
          </button>
          </Link>
        </div>
    </div>
  );
}