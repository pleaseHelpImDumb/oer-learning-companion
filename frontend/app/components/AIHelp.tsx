"use client";

import { useRouter } from "next/navigation";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";

export default function StuckModal() {
  const router = useRouter();
  const { state, closeAssistant, setTab, setInput, send } = useStuckAssistant();

  if (!state.open) return null;

  const handleAction = (fn: () => void) => {
    closeAssistant();
    fn();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/13 flex items-center justify-end p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Study Assistant"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAssistant();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 sm:p-8 h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={closeAssistant}
          aria-label="Close"
          className="absolute top-3 right-3 sm:top-4 sm:right-4
                     w-9 h-9 flex items-center justify-center
                     rounded-full bg-[#ADD8E6]/50 hover:bg-[#ADD8E6]/70 transition"
        >
          <span className="text-lg font-semibold">×</span>
        </button>

        <p className="pl-1 font-semibold text-[clamp(1rem,2vw,1.5rem)]">🟧 Study Assistant</p>
        <div className="w-full h-px bg-black/30 mt-3" />

        <div className="flex flex-row font-semibold text-xl gap-3 -mb-px mt-2">
          <button
            onClick={() => setTab("chat")}
            className={`px-3 py-1 border-b-2 transition-colors ${
              state.tab === "chat"
                ? "border-[#0077B6] text-[#0077B6]"
                : "border-transparent hover:border-[#0077B6] hover:text-[#0077B6]"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-3 py-1 border-b-2 transition-colors ${
              state.tab === "history"
                ? "border-[#0077B6] text-[#0077B6]"
                : "border-transparent hover:border-[#0077B6] hover:text-[#0077B6]"
            }`}
          >
            History
          </button>
        </div>

        <div className="w-full h-px bg-black/30" />

        <div className="flex-1 overflow-y-auto py-4">
          {state.tab === "history" ? (
            <div className="text-sm opacity-70">History will go here.</div>
          ) : (
            <div className="space-y-3">
              {state.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "ml-auto bg-black/10" : "mr-auto bg-black/5"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-black/20">
          <p className="text-xs italic opacity-70 mb-2">
            This tool supports learning—it won&apos;t do the work for you.
          </p>

          <div className="flex items-center gap-2">
            <input
              value={state.input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="What’s hard to understand?"
              className="flex-1 rounded-md border border-black/30 px-3 py-2 text-sm outline-none focus:border-black/60"
            />
            <button
              onClick={send}
              className="rounded-md border border-black/30 px-3 py-2 text-sm hover:bg-black/5"
              aria-label="Send"
            >
              ↩︎
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}