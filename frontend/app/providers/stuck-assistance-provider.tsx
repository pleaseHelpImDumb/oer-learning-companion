"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";

export type Msg = { id: string; role: "user" | "assistant"; text: string };

type State = {
  open: boolean;
  tab: "chat" | "history";
  input: string;
  messages: Msg[];
};

type Action =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET_TAB"; tab: State["tab"] }
  | { type: "SET_INPUT"; input: string }
  | { type: "ADD_MESSAGES"; messages: Msg[] }
  | { type: "RESET" };

const initialState: State = {
  open: false,
  tab: "chat",
  input: "",
  messages: [{ id: "m0", role: "assistant", text: "What’s hard to understand?" }],
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
  send: () => void;
};

const StuckAssistantContext = createContext<Ctx | null>(null);

export function StuckAssistantProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo<Ctx>(() => {
    return {
      state,
      openAssistant: () => dispatch({ type: "OPEN" }),
      closeAssistant: () => dispatch({ type: "CLOSE" }),
      setTab: (t) => dispatch({ type: "SET_TAB", tab: t }),
      setInput: (s) => dispatch({ type: "SET_INPUT", input: s }),
      send: () => {
        const text = state.input.trim();
        if (!text) return;

        dispatch({
          type: "ADD_MESSAGES",
          messages: [
            { id: crypto.randomUUID(), role: "user", text },
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: "Got it — which part is tripping you up?",
            },
          ],
        });
        dispatch({ type: "SET_INPUT", input: "" });
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
  if (!ctx) throw new Error("useStuckAssistant must be used within StuckAssistantProvider");
  return ctx;
}