export default function Home() {
  return (
    <div className="bg-[#fdf5e7] min-h-screen">
      <div className="flex gap-1 px-6 pt-10">
        <div className="flex flex-col w-full">
          <div className="pl-[1%] max-w-[70%] min-w-[70%] pt-[3%]">
            <div className="bg-[#235937] rounded-t-2xl pt-[3%] pb-[3%]">
              <b className="text-white pl-[3%] text-3xl">My Progress</b>
            </div>
              <div className="bg-[#fdf5e7] pt-[2%] pb-[5%] border border-[#d8d8d8] drop-shadow-xl rounded-b-2xl">
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
              <div className="bg-[#fdf5e7] pb-[5%] border border-[#d8d8d8] drop-shadow-xl rounded-2xl">
                  <div className="bg-[#235937] rounded-t-2xl pt-[3%]">
                        <b className="text-white pl-[3%] text-3xl">Rewards</b>
                      </div>
                <div className="flex gap-3 w-[90%] mx-auto pt-[2%]">
                  
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
      <div className="bg-[#235937] pt-[2%] rounded-2xl max-w-[35%] min-w-[35%] ">
        <p className="text-white pl-[3%] text-3xl text-[#ffffff] font-semibold items-center flex flex-col">Set Today's Goal</p>
      </div>
    </div>
  </div>  
  );
}