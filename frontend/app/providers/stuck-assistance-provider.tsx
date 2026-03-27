"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import ReactMarkdown from 'react-markdown';
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
              text: "That's a fantastic question! `y = mx + b` is the **slope-intercept form** of a linear equation, and it's one of the most fundamental formulas you'll encounter in mathematics and across many academic disciplines.\n\nLet's break it down:\n\n*   **`y`**: This represents the **dependent variable** or the output. Its value depends on the value of `x`.\n*   **`x`**: This represents the **independent variable** or the input. You choose a value for `x`, and that determines `y`.\n*   **`m`**: This is the **slope** of the line. It tells you the rate of change of `y` with respect to `x`.\n    *   A positive `m` means `y` increases as `x` increases.\n    *   A negative `m` means `y` decreases as `x` increases.\n    *   A larger absolute value of `m` means a steeper line (a faster rate of change).\n*   **`b`**: This is the **y-intercept**. It's the value of `y` when `x = 0`. Think of it as the starting point or the initial value.\n\n### What it's Used For:\n\n`y = mx + b` is used to **model and understand linear relationships** between two variables. Anytime you have a situation where one quantity changes at a constant rate with respect to another, this equation is your go-to tool.\n\nCommon applications include:\n\n1.  **Prediction and Forecasting**: If you know the linear relationship, you can predict future outcomes (`y`) based on inputs (`x`).\n2.  **Trend Analysis**: Identifying and quantifying the rate at which something is changing over time or with respect to another factor.\n3.",
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