"use client";

import { useRouter } from "next/navigation";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useState } from "react";

export default function StuckModal() {
  const router = useRouter();
  const { state, closeAssistant, setTab, setInput, setSupportLevel, send } =
    useStuckAssistant();  const [open, setOpen] = useState(false);

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
                    m.role === "user"
                      ? "ml-auto bg-black/10"
                      : "mr-auto bg-black/5"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-code:bg-transparent prose-code:px-0 prose-code:py-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
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

                            return (
                              <pre className="overflow-x-auto rounded-lg bg-black/10 p-3">
                                <code {...props}>{children}</code>
                              </pre>
                            );
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
          )}
        </div>

        <div className="pt-3 border-t border-black/20">
          <p className="text-xs italic opacity-70 mb-2">
            This tool supports learning—it won&apos;t do the work for you.
          </p>

          <div className="flex items-end gap-2 dark:border-1 dark:border-white/60">
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

            <div className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-[#0B0B26] dark:text-white/70 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-[#28284F]"
              >
                <span>Support Level</span>
                <svg
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {open && (
                <div className="absolute bottom-full right-0 z-[100] mb-2 w-56 origin-bottom-right rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSupportLevel("1");
                        setOpen(false);
                      }}
                    >
                      1
                    </button>

                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSupportLevel("2");
                        setOpen(false);
                      }}
                    >
                      2
                    </button>

                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSupportLevel("3");
                        setOpen(false);
                      }}
                    >
                      3
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}