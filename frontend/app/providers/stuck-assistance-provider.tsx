"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";

export type Msg = { id: string; role: "user" | "assistant"; text: string };

type State = {
  open: boolean;
  tab: "chat" | "history";
  input: string;
  messages: Msg[];
  loading: boolean;
  supportLevel: "1" | "2" | "3";
};

type Action =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET_TAB"; tab: State["tab"] }
  | { type: "SET_INPUT"; input: string }
  | { type: "ADD_MESSAGES"; messages: Msg[] }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_SUPPORT_LEVEL"; supportLevel: State["supportLevel"] }
  | { type: "RESET" };

const initialState: State = {
  open: false,
  tab: "chat",
  input: "",
  loading: false,
  supportLevel: "1",
  messages: [
    {
      id: "m0",
      role: "assistant",
      text: "Greetings! I am the OER Learning Companion study assistant! Just start a study session to get chatting!",
    },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN":
      return { ...state, open: true };
    case "CLOSE":
      return { ...state, open: false };
    case "SET_TAB":
      return { ...state, tab: action.tab };
    case "SET_INPUT":
      return { ...state, input: action.input };
    case "ADD_MESSAGES":
      return { ...state, messages: [...state.messages, ...action.messages] };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_SUPPORT_LEVEL":
      return { ...state, supportLevel: action.supportLevel };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  openAssistant: () => void;
  closeAssistant: () => void;
  setTab: (t: State["tab"]) => void;
  setInput: (s: string) => void;
  setSupportLevel: (level: State["supportLevel"]) => void;
  send: (levelOverride?: State["supportLevel"]) => Promise<void>;
};

const StuckAssistantContext = createContext<Ctx | null>(null);

export function StuckAssistantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo<Ctx>(() => {
    return {
      state,
      openAssistant: () => dispatch({ type: "OPEN" }),
      closeAssistant: () => dispatch({ type: "CLOSE" }),
      setTab: (t) => dispatch({ type: "SET_TAB", tab: t }),
      setInput: (s) => dispatch({ type: "SET_INPUT", input: s }),
      setSupportLevel: (level) =>
        dispatch({ type: "SET_SUPPORT_LEVEL", supportLevel: level }),

      send: async (levelOverride) => {
        const text = state.input.trim();
        if (!text || state.loading) return;

        const userMessage: Msg = {
          id: crypto.randomUUID(),
          role: "user",
          text,
        };

        dispatch({
          type: "ADD_MESSAGES",
          messages: [userMessage],
        });

        dispatch({ type: "SET_INPUT", input: "" });
        dispatch({ type: "SET_LOADING", loading: true });

        try {
          const csrfToken = localStorage.getItem("csrfToken"); // if you're storing it there

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const res = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: "POST",
            credentials: "include", // send auth cookie
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
            },
            body: JSON.stringify({
              message: text,
              supportLevel: Number(levelOverride ?? state.supportLevel),
            }),
          });

const rawText = await res.text();
console.log("[AI CHAT RAW RESPONSE]", rawText);

let data: any = {};
try {
  data = rawText ? JSON.parse(rawText) : {};
} catch {
  data = {};
}

console.log("[AI CHAT RESPONSE]", {
  ok: res.ok,
  status: res.status,
  statusText: res.statusText,
  data,
});

if (!res.ok) {
  throw new Error(
    data?.error ||
      data?.message ||
      `${res.status} ${res.statusText}` ||
      "Failed to get AI response"
  );
}

          dispatch({
            type: "ADD_MESSAGES",
            messages: [
              {
                id: crypto.randomUUID(),
                role: "assistant",
                text: data.response || "No response returned.",
              },
            ],
          });
        } catch (error) {
            console.warn("[STUCK ASSISTANT ERROR]", error);

            dispatch({
              type: "ADD_MESSAGES",
              messages: [
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  text:
                    error instanceof Error
                      ? `Error: ${error.message}`
                      : "Something went wrong while contacting the AI.",
                },
              ],
            });
          } finally {
          dispatch({ type: "SET_LOADING", loading: false });
        }
      },
    };
  }, [state]);

  return (
    <StuckAssistantContext.Provider value={api}>
      {children}
    </StuckAssistantContext.Provider>
  );
}

export function useStuckAssistant() {
  const ctx = useContext(StuckAssistantContext);
  if (!ctx)
    throw new Error(
      "useStuckAssistant must be used within StuckAssistantProvider",
    );
  return ctx;
}
