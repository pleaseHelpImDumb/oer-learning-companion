import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col ">
      <div className=" py-[2%] px-[2%] w-full h-full">
        <div className="bg-[#ffd36b] rounded-lg pl-[1%] font-semibold text-white text-xl py-[2%]">
          <a className="text-black">Lorem ipsum</a>
        </div>
      </div>

      <div className="flex flex-row gap-10 px-6">
        <div className="flex flex-col w-full h-full">
          <div className=" max-w-[100%] min-w-[100%]">
            <div className="bg-[#235937] rounded-t-2xl pt-[3%] pb-[3%]">
              <b className="text-white pl-[3%] text-3xl">My Progress</b>
            </div>
              <div className="bg-[#fdf5e7] pt-[2%] pb-[5%] max-h-[50%] min-h-[50%] border border-[#d8d8d8] drop-shadow-xl rounded-b-2xl">
                <div className="flex gap-3 w-[90%] mx-auto">
                  
                  <div className="flex-1 flex flex-col items-center bg-[#fbeabd] rounded-xl pt-[5%] pb-[3%] border border-[#d8d8d8]">
                    <p className="text-[#235937] font-semibold text-[clamp(2.5rem,5vw,4rem)]">5</p>
                    <p className="text-[#235937] font-semibold text-[clamp(1rem,2vw,1.5rem)]">Hours Studied</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center bg-[#fbeabd] rounded-xl pt-[5%] pb-[3%] border border-[#d8d8d8]">
                    <p className="text-[#235937] font-semibold text-[clamp(2.5rem,5vw,4rem)]">12</p>
                    <p className="text-[#235937] font-semibold text-[clamp(1rem,2vw,1.5rem)]">Tokens</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center bg-[#fbeabd] rounded-xl pt-[5%] pb-[3%] border border-[#d8d8d8]">
                    <p className="text-[#235937] font-semibold text-[clamp(2.5rem,5vw,4rem)]">⭐</p>
                    <p className="text-[#235937] font-semibold text-[clamp(1rem,2vw,1.2rem)] text-center px-2">
                      5 day study streak Badge
                    </p>
                  </div>
                </div>
                  <a className="flex flex-col pt-[3%] items-center text-[#235937] font-semibold">Prize-O-Meter</a>
              </div>

                <div className="pb-[5%]">

                </div>
                
              <div className="bg-[#fdf5e7] pb-[5%] max-h-[50%] min-h-[50%] border border-[#d8d8d8] drop-shadow-xl rounded-2xl">
                  <div className="bg-[#235937] rounded-t-2xl py-[3%] px-[3%]">
                        <b className="text-white py-[3%] text-3xl">Rewards</b>
                      </div>
                <div className="flex gap-3 w-[90%] mx-auto pt-[3%]">
                  
                  <div className="flex-1 flex flex-col items-center bg-[#235937] rounded-xl pt-[5%] pb-[3%] border border-[#d8d8d8]">
                    <p className="text-[#ffffff] font-semibold text-[clamp(2.5rem,5vw,4rem)]">50</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center bg-[#235937] rounded-xl pt-[5%] pb-[3%] border border-[#d8d8d8]">
                    <p className="text-[#ffffff] font-semibold text-[clamp(2.5rem,5vw,4rem)]">5</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center bg-[#ffd36b] rounded-xl pt-[5%] pb-[3%] border border-[#d8d8d8]">
                    <p className="text-[#ffffff] font-semibold text-[clamp(2.5rem,5vw,4rem)]">Play</p>
                  </div>
                </div>
                <a className="text-[#235937] font-semibold pt-[10%] pl-[12%]">
                  Rewards Points
                </a>
                <a className="text-[#235937] font-semibold pt-[10%] pl-[18%]">
                  Badges
                </a>
                <a className="text-[#235937] font-semibold pt-[10%] pl-[18%]">
                  Play a Mini-Game
                </a>
              </div>
            </div>
            <div>
          </div>
        </div>  
        <div className="pt-10">

        </div>
<div className="bg-[#235937] rounded-2xl max-w-[50%] min-w-[50%] flex flex-col items-center gap-6">
          <p className="text-white pt-[5%] text-3xl text-[#ffffff] font-semibold items-center flex flex-col pb-[2%]">Set Today's Goal</p>
        <p className="flex flex-col items-center text-white">Set a session length to start.</p>
        <p className="flex flex-col items-center text-white">Select number of:</p>
        <select
        defaultValue="breaks"
        className="
          appearance-none
          bg-[#1f2a3a] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="breaks">Breaks</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>
      <p className="flex flex-col items-center text-white">Select:</p>
      <select
        defaultValue="breaks"
        className="
          appearance-none
          bg-[#1f2a3a] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="breaks">Breaks</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>
            <p className="flex flex-col items-center text-white">Minutes*:</p>
      <select
        defaultValue="breaks"
        className="
          appearance-none
          bg-[#1f2a3a] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="breaks">Breaks</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>

      <div className="inline-flex items-center justify-center
                bg-[#7ED957] px-4 py-4
                rounded-full shadow-inner
                text-[#0b1f14]
                text-3xl font-bold
                tracking-widest
                font-digital">
        00:00:00
      </div>
        <Link href="login" className="w-full flex justify-center">
          <button className="w-[90%] sm:w-[70%] py-4 rounded-2xl bg-[#D0A234] text-white font-semibold text-lg sm:text-xl">
            Start Session
          </button>
        </Link>
        <div className="pb-5">

        </div>
      </div>
    </div>
    </div>
  );
}