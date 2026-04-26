"use client";

import { useRouter } from "next/navigation";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useState } from "react";
import Image from "next/image";
export default function StuckModal() {
  const router = useRouter();
  const { state, closeAssistant, setTab, setInput, send } = useStuckAssistant();  
const [supportMenuOpen, setSupportMenuOpen] = useState(false);
const [selectedSupport, setSelectedSupport] = useState<"1" | "2" | "3">("1");
const [history, setHistory] = useState<any[]>([]);
const [historyLoading, setHistoryLoading] = useState(false);
const supportOptions = [
  { level: "1", base: "hint" },
  { level: "2", base: "stuck" },
  { level: "3", base: "struggle" },
] as const;

const selectedOption = supportOptions.find(
  (option) => option.level === selectedSupport
)!;

  if (!state.open) return null;

  const cleanAssistantText = (text: string) => {
    return text
      .replace(/\\n/g, "\n")
      .replace(/\\'/g, "'")
      .replace(/`([^`]+)`/g, (_, expr) => {
        const isSingleVariable = /^[a-zA-Z]$/.test(expr);
        const looksLikeMath = /[=+\-*/^]|\\frac|\\sqrt|[0-9]/.test(expr);

        if (isSingleVariable || looksLikeMath) {
          return `$${expr}$`;
        }

        return `\`${expr}\``;
      })
      .replace(/[ \t]+/g, " ")
      .trim();
  };
async function loadHistory() {
  try {
    setHistoryLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/history`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("History failed:", data);
      setHistory([]);
      return;
    }

    setHistory(data.history ?? []);
  } catch (err) {
    console.error("Could not load AI history:", err);
    setHistory([]);
  } finally {
    setHistoryLoading(false);
  }
}
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
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 sm:p-8 h-[80vh] overflow-hidden flex flex-col dark:bg-[#0B0B26]">
        <button
          onClick={closeAssistant}
          aria-label="Close"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#ADD8E6]/50 hover:bg-[#ADD8E6]/70 transition"
        >
          <span className="text-lg font-semibold">×</span>
        </button>

        <p className="pl-1 font-semibold text-[clamp(1rem,2vw,1.5rem)] dark:text-white/80">
          🟧 Study Assistant
        </p>
        <div className="w-full h-px bg-black/30 dark:bg-white/80 mt-3" />

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
onClick={() => {
  setSupportMenuOpen(false);
  setTab("history");
  loadHistory();
}} 
           className={`px-3 py-1 border-b-2 transition-colors ${
              state.tab === "history"
                ? "border-[#0077B6] text-[#0077B6]"
                : "border-transparent hover:border-[#0077B6] hover:text-[#0077B6]"
            }`}
          >
            History
          </button>
        </div>

        <div className="w-full h-px bg-black/30 dark:bg-white/80" />
{state.tab === "history" ? (
  <div className="flex-1 overflow-y-auto py-4">
    <div className="space-y-3">
      {historyLoading ? (
        <div className="text-sm opacity-70">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-sm opacity-70">No AI history yet.</div>
      ) : (
        history.map((m) => (
          <div
            key={m.interactionId}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "USER"
                ? "ml-auto bg-black/10 dark:bg-white/10"
                : "mr-auto bg-black/5 dark:bg-white/5"
            }`}
          >
            <div className="mb-1 text-[10px] uppercase opacity-50">
              {m.role === "USER" ? "You" : "AI"}
            </div>
            <div>{m.message}</div>
          </div>
        ))
      )}
    </div>
  </div>
) : (
  <>
    <div className="flex-1 overflow-y-auto py-4">
      <div className="space-y-3">
        {state.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "ml-auto bg-black/10" : "mr-auto bg-black/5"
            }`}
          >
            {m.role === "assistant" ? (
              <div className="prose prose-sm prose-code:bg-transparent prose-code:px-0 prose-code:py-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    pre({ children }) {
                      return (
                        <pre className="overflow-x-auto rounded-lg bg-black/10 p-3">
                          {children}
                        </pre>
                      );
                    },
                    code({ inline, children, ...props }: any) {
                      const text = String(children);

                      if (inline && /^[a-zA-Z]$/.test(text)) {
                        return <span className="italic">{text}</span>;
                      }

                      if (inline && /[=+\-*/^]/.test(text)) {
                        return <span className="font-mono">{text}</span>;
                      }

                      if (inline) {
                        return (
                          <code
                            className="rounded bg-black/10 px-1 py-0.5 text-[0.9em]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return <code {...props}>{children}</code>;
                    },
                  }}
                >
                  {cleanAssistantText(m.text)}
                </ReactMarkdown>
              </div>
            ) : (
              <div>{m.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>

    <div className="pt-3 border-t border-black/20 dark:border-white/20">
      <p className="mb-2 text-xs italic opacity-70">
        This tool supports learning—it won&apos;t do the work for you.
      </p>

      <div className="flex items-end gap-2">
        <input
          value={state.input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(selectedSupport);
          }}
          placeholder="What’s hard to understand?"
          className="flex-1 rounded-md border border-black/30 px-3 py-2 text-sm outline-none focus:border-black/60 dark:border-white/30 dark:bg-[#0B0B26] dark:text-white dark:placeholder:text-white/50"
        />

        <button
          type="button"
          onClick={() => send(selectedSupport)}
          className="rounded-lg transition hover:scale-105"
          aria-label={`Send with ${selectedOption.base} support`}
        >
          <Image
            src={`/${selectedOption.base}.png`}
            alt={selectedOption.base}
            width={120}
            height={50}
            className="h-[38px] w-auto object-contain"
            draggable={false}
          />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setSupportMenuOpen((prev) => !prev)}
            className="rounded-md border border-black/30 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
            aria-label="Choose support level"
          >
            ▼
          </button>

          {supportMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 flex w-max flex-col gap-2 rounded-lg border border-black/20 bg-white p-2 shadow-lg dark:border-white/20 dark:bg-[#0B0B26]">
              {supportOptions.map(({ level, base }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setSelectedSupport(level);
                    setSupportMenuOpen(false);
                  }}
                  className="rounded-md transition hover:scale-105"
                >
                  <Image
                    src={`/${base}.png`}
                    alt={base}
                    width={160}
                    height={55}
                    className="h-auto w-[160px] max-w-none object-contain"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/*<div className="mt-3 flex flex-wrap gap-3">
  {[
    { level: "1", base: "hint" },
    { level: "2", base: "stuck" },
    { level: "3", base: "struggle" },
  ].map(({ level, base }) => {
    const isSelected = state.supportLevel === level;

    return (
      <button
        key={level}
        type="button"
        onClick={() => setSupportLevel(level as "1" | "2" | "3")}
        aria-pressed={isSelected}
        className={`rounded-lg transition ${
          isSelected ? "scale-105" : "hover:scale-105"
        }`}
      >
        <div className="w-[120px] h-[50px] flex items-center justify-center">
          <Image
            src={`/${base}${isSelected ? "_selected" : ""}.png`}
            alt={base}
            width={120}
            height={50}
            className="h-[50px] w-auto object-contain"
            draggable={false}
          />
        </div>
      </button>
    );
  })}
</div>*/}
</div>
      </div>
  );
}