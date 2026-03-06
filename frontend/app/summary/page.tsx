import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full">
      {/* page padding + max width so things don't stretch weirdly on ultrawide */}
      <div className="mx-auto w-full max-w-12xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-6">
          {/* TOP ROW: Progress + Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Progress card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:col-span-3">
              <div className="w-full max-w-sm sm:max-w-md mx-auto aspect-square relative">
                <Image
                  src="/assets/progress_circle/1.png"
                  alt="progress: 0%"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Notes card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-black font-semibold text-xl sm:text-2xl lg:text-3xl">
                Notes
              </h2>
              <p className="text-black mt-2 mb-3">
                ☰ Add a note about this study session...
              </p>

              <textarea
                className="border border-gray-300 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black p-3 min-h-[140px] sm:min-h-[200px] resize-none"
                placeholder="What do you want to remember or reflect upon for next time..."
              />
            </div>
          </div>

          {/* MID ROW: stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <p className="text-black font-bold text-[clamp(1.1rem,1.6vw,2rem)] leading-tight">
                Study Goals Completed
              </p>
              <p className="text-[#235937] font-bold mt-3 text-[clamp(2rem,4vw,4rem)]">
                3
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <p className="text-black font-bold text-[clamp(1.1rem,1.6vw,2rem)] leading-tight">
                Hours Studied This Week
              </p>
              <p className="text-[#235937] font-bold mt-3 text-[clamp(2rem,4vw,4rem)]">
                3
              </p>
            </div>
          </div>

          {/* BOTTOM: 4-up metrics */}
          <div className="bg-white rounded-2xl p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                ["Check-Ins", "12"],
                ["Duration Net", "120 Min"],
                ["AI Help Count", "5"],
                ["With Breaks", "2"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-black font-bold text-[clamp(1rem,1.4vw,1.8rem)]">
                    {label}
                  </p>
                  <p className="text-[#235937] font-bold mt-1 text-[clamp(1.6rem,2.5vw,2.8rem)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* optional dividers on large screens */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6 mt-4">
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}