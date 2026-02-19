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
        <a className="font-semibold text-[clamp(1rem,2vw,1.5rem)]">Log-in</a>
        <div className="pb-[6%]"></div>
        <div className="flex flex-col">
            <label htmlFor="campus" className="mb-1">Username/Email</label>
            <input
              id="campus"
              className="w-80 bg-white border border-black rounded p-2"
            />
        </div>
        <div className="pb-[4%]"></div>
        <div className="flex flex-col">
            <label htmlFor="campus" className="mb-1">Password</label>
            <input
              id="campus"
              className="w-80 bg-white border border-black rounded p-2"
            />
        </div>
        <div className="flex justify-center w-full pt-6 pb-[2%]">
        <Link href="login">
            <button className="rounded-lg px-8 py-3 text-white bg-[#235937]">
            Submit
            </button>
        </Link>
        </div>
        <div className="flex justify-center w-full pt-6">
        <Link href="forgor">
            <p className="text-[#0000FF]">Forgot your password?</p>
        </Link>
        </div>
        <div className="flex justify-center w-full pt-6 pb-[3%]">
        <Link href="register">
            <p className="text-[#0000FF]">Create an Account</p>
        </Link>
        </div>
      </div>

    </div>
  );
}