import Image from "next/image";
import Link from "next/link";
import background from "assets/login_background.jpg";
export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center font-sans">
      
      <Image
        src="/login_background.jpg"
        alt="Background"
        fill
        className="object-cover -z-10"
      />

      <div className="bg-white pl-[2%] pr-[2%] pt-[1%] rounded-xl shadow-lg">
        <div className="flex flex-row">
        <div>
            <Link href="login">
            <p className="text-[#808080]">&lt; back</p>
            </Link>
        </div>
        <div>
            <p className=" pl-[5%] pb-[3%] font-semibold text-[clamp(1rem,2vw,1.5rem)]">Registration</p>
            <div className="flex flex-row gap-6">
                <div className="flex flex-col">
                    <label htmlFor="campus" className="mb-1">First Name</label>
                    <input
                    id="campus"
                    className="w-80 bg-white border border-black rounded p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="campus" className="mb-1">Last Name</label>
                    <input
                    id="campus"
                    className="w-80 bg-white border border-black rounded p-2"
                    />
                </div>
            </div>
            <div className="pt-[1%]">
                <div className="flex flex-col">
                    <label htmlFor="campus" className="mb-1">Email</label>
                    <input
                    id="campus"
                    className="w-full bg-white border border-black rounded p-2"
                    />
                </div>
            </div>

            <div className="flex flex-row gap-6 pt-[1%]">
                <div className="flex flex-col">
                    <label htmlFor="campus" className="mb-1">Password</label>
                    <input
                    id="campus"
                    className="w-80 bg-white border border-black rounded p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="campus" className="mb-1">Confirm Password</label>
                    <input
                    id="campus"
                    className="w-80 bg-white border border-black rounded p-2"
                    />
                </div>
            </div>
            <div className="flex items-center justify-center pt-[3%]">
                <Link href="timer">
                    <button className="rounded-lg px-8 py-3 text-white bg-[#235937]">
                    Submit
                    </button>
                </Link>
            </div>
            <div className="pb-[3%]">

            </div>
        </div>
        </div>
      </div>

    </div>
  );
}