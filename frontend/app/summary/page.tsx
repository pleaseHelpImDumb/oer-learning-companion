import Image from "next/image";
import Link from "next/link";
import background from "assets/login_background.jpg";
export default function Home() {
  return (
    <div className="flex flex-col gap-2 w-full h-full">

        <div className="pl-[3%] pt-[2%]">
        <div className="flex flex-row gap-6 w-full">
            <div className="bg-[#FFFFFF] max-w-[50%] min-w-[60%] rounded-2xl">
                <a>test</a>
            </div>

            <div className="bg-[#FFFFFF] max-w-[30%] min-w-[35%] h-90 rounded-2xl px-[2%] ">
                <a className="text-black font-semibold text-3xl">Notes</a>
                <p className="text-black pb-[1%]">☰ Add a note about this study session...</p>
                <textarea className="border resize-none border-gray-300 h-[80%] w-full rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" 
                placeholder="What do you want to remember or reflect upon for next time...">
                </textarea>
            </div>
        </div>
        <div className="pt-[2%]"></div>
        <div className="flex flex-row w-full gap-8">
            <div className="bg-[#FFFFFF] h-[40%] w-[19%] rounded-2xl">
                <div className="flex flex-col">
                    <p className="text-4xl font-bold text-black pl-[4%] pt-[2%] w-[70%]">Study Goals Completed</p>
                    <p className="text-7xl font-bold text-[#235937] pl-[4%] pt-[2%] w-[50%]">3</p>
                </div>
            </div>
            <div className="bg-[#FFFFFF] h-[40%] w-[19%] rounded-2xl">
                <div className="flex flex-col">
                    <p className="text-4xl font-bold text-black pl-[4%] pt-[2%] w-[90%]">Hours Studied This Week</p>
                    <div className="flex flex-row">
                        <p className="text-7xl font-bold text-[#235937] pl-[4%] pt-[2%] w-[50%]">3</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="pt-[2%]"></div>
        <div className="flex flex-row gap-6 w-[98%] bg-white rounded-2xl justify-center items-stretch">

            <div className="flex flex-col w-[15%] pl-[4%] pt-[2%]">
                <span className="text-black text-2xl font-bold">Check-Ins</span>
                <span className="text-[#235937] text-5xl font-bold pt-[1%]">12</span>
            </div>

            <div className="flex flex-col justify-center self-stretch">
                <div className="w-px h-[70%] bg-gray-400 rounded-full"></div>
            </div>

            <div className="flex flex-col w-[15%] pl-[4%] pt-[2%]">
                <span className="text-black text-2xl font-bold">Duration Net</span>
                <span className="text-[#235937] text-5xl font-bold pt-[1%]">120 Min</span>
            </div>

            <div className="flex flex-col justify-center self-stretch">
                <div className="w-px h-[70%] bg-gray-400 rounded-full"></div>
            </div>

            <div className="flex flex-col w-[15%] pl-[4%] pt-[2%]">
                <span className="text-black text-2xl font-bold">AI Help Count</span>
                <span className="text-[#235937] text-5xl font-bold pt-[1%]">5</span>
            </div>

            <div className="flex flex-col justify-center self-stretch">
                <div className="w-px h-[70%] bg-gray-400 rounded-full"></div>
            </div>

            <div className="flex flex-col w-[15%] pl-[4%] pt-[2%]">
                <span className="text-black text-2xl font-bold">With Breaks</span>
                <span className="text-[#235937] text-5xl font-bold pt-[1%]">2</span>
            </div>

        </div>
        </div>
    </div>
  );
}