"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
type Cell = "X" | "O" | null;

type TicTacToeProps = {
  availableTokens: number;
  requiredTokens?: number;
  onSpendTokens?: (amount: number) => Promise<boolean> | boolean;
};

export default function TicTacToe({
  availableTokens,
  requiredTokens = 4,
  onSpendTokens,
}: TicTacToeProps) {
  const winningLines: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Your turn");
  const [showEntryModal, setShowEntryModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessingUnlock, setIsProcessingUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
const [isProcessingReset, setIsProcessingReset] = useState(false);
const lastResetAtRef = useRef(0);

const RESET_COOLDOWN_MS = 1000;
  const freeTokens = // If a user navigates to tictactoe from a "stuck" modal "activity" press, then give them free tokens.
  //It may frustrate a user if their help is gated by resource management
  typeof window !== "undefined"
    ? Number(localStorage.getItem("freeGameTokens") || "0")
    : 0;
  const hasEnoughTokens = availableTokens + freeTokens >= requiredTokens;
  const isLocked = !isUnlocked;

  function calculateWinner(currentBoard: Cell[]): "X" | "O" | null {
    for (const [a, b, c] of winningLines) {
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a];
      }
    }
    return null;
  }

  const winner = useMemo(() => calculateWinner(board), [board]);
  const isDraw = !winner && board.every((cell) => cell !== null);

  useEffect(() => {
    if (showEntryModal) {
      if (!hasEnoughTokens) {
        setStatusMessage(`You need at least ${requiredTokens} tokens to play.`);
      } else {
        setStatusMessage(
          `Starting a game costs ${requiredTokens} tokens.`,
        );
      }
      return;
    }

    if (isLocked) {
      setStatusMessage(`Starting a game costs ${requiredTokens} tokens.`);
      return;
    }

    if (winner === "X") {
      setStatusMessage("You win!");
      return;
    }
    if (winner === "O") {
      setStatusMessage("Computer wins!");
      return;
    }
    if (isDraw) {
      setStatusMessage("It's a draw");
      return;
    }

    setStatusMessage(isPlayerTurn ? "Your turn" : "Computer is thinking...");
  }, [
    winner,
    isDraw,
    isPlayerTurn,
    isLocked,
    showEntryModal,
    hasEnoughTokens,
    requiredTokens,
  ]);

  function getRandomEmptyIndex(currentBoard: Cell[]): number | null {
    const emptyIndexes = currentBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter((value): value is number => value !== null);

    if (emptyIndexes.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * emptyIndexes.length);
    return emptyIndexes[randomIndex];
  }

  function focusCell(index: number) {
    cellRefs.current[index]?.focus();
  }

  function getNextIndex(index: number, key: string) {
    const row = Math.floor(index / 3);
    const col = index % 3;

    switch (key) {
      case "ArrowRight":
        if (index + 1 <= 8 && Math.floor((index + 1) / 3) === row) return index + 1;
        if (index + 3 <= 8) return index + 3;
        return index;
      case "ArrowLeft":
        if (index - 1 >= 0 && Math.floor((index - 1) / 3) === row) return index - 1;
        if (index - 3 >= 0) return index - 3;
        return index;
      case "ArrowDown":
        return index + 3 <= 8 ? index + 3 : index;
      case "ArrowUp":
        return index - 3 >= 0 ? index - 3 : index;
      case "Home":
        return row * 3;
      case "End":
        return row * 3 + 2;
      default:
        return index;
    }
  }

  function handleComputerMove(updatedBoard: Cell[]) {
    const boardWinner = calculateWinner(updatedBoard);
    const boardIsDraw = updatedBoard.every((cell) => cell !== null);

    if (boardWinner || boardIsDraw || isLocked) {
      return;
    }

    const computerMove = getRandomEmptyIndex(updatedBoard);
    if (computerMove === null) return;

    const finalBoard = [...updatedBoard];
    finalBoard[computerMove] = "O";

    setTimeout(() => {
      setBoard(finalBoard);
      setIsPlayerTurn(true);
      focusCell(computerMove);
    }, 400);
  }

  function handleClick(index: number) {
    if (isLocked || !isPlayerTurn || board[index] || winner || isDraw) return;

    const nextBoard = [...board];
    nextBoard[index] = "X";

    setBoard(nextBoard);
    setIsPlayerTurn(false);
    handleComputerMove(nextBoard);
  }

  function handleCellKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      focusCell(getNextIndex(index, event.key));
    }

    if ((event.key === "Enter" || event.key === " ") && isPlayerTurn && !isLocked) {
      event.preventDefault();
      handleClick(index);
    }
  }

  async function handleConfirmPlay() {
    if (!hasEnoughTokens) return;

    setIsProcessingUnlock(true);
    setUnlockError("");

    try {
      let success = true;

if (freeTokens >= requiredTokens) {
  localStorage.setItem("freeGameTokens", String(freeTokens - requiredTokens));
} else {
  if (onSpendTokens) {
    const result = await onSpendTokens(requiredTokens);
    success = Boolean(result);
  }
}

      if (!success) {
        setUnlockError("Could not spend tokens. Please try again.");
        return;
      }

      setIsUnlocked(true);
      setShowEntryModal(false);
      setBoard(Array(9).fill(null));
      setIsPlayerTurn(true);

      setTimeout(() => focusCell(0), 0);
    } catch (error) {
      setUnlockError("Could not spend tokens. Please try again.");
    } finally {
      setIsProcessingUnlock(false);
    }
  }

  function handleCancelPlay() {
    setShowEntryModal(false);
    setIsUnlocked(false);
  }

async function resetGame() {
  if (isProcessingReset || isProcessingUnlock) return;

  const now = Date.now();
  if (now - lastResetAtRef.current < RESET_COOLDOWN_MS) return;

  if (!hasEnoughTokens) {
    setUnlockError(`You need at least ${requiredTokens} tokens to reset.`);
    return;
  }

  lastResetAtRef.current = now;
  setIsProcessingReset(true);
  setUnlockError("");

  try {
    let success = true;

if (freeTokens >= requiredTokens) {
  localStorage.setItem("freeGameTokens", String(freeTokens - requiredTokens));
} else {
  if (onSpendTokens) {
    const result = await onSpendTokens(requiredTokens);
    success = Boolean(result);
  }
}

    if (!success) {
      setUnlockError("Could not spend tokens. Please try again.");
      return;
    }

    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setIsUnlocked(true);
    setShowEntryModal(false);

    setTimeout(() => focusCell(0), 0);
  } catch (error) {
    setUnlockError("Could not spend tokens. Please try again.");
  } finally {
    setIsProcessingReset(false);
  }
}

  function getCellLabel(cell: Cell, index: number) {
    const cellNumber = index + 1;

    if (cell === "X") return `Cell ${cellNumber}, X`;
    if (cell === "O") return `Cell ${cellNumber}, O`;
    return `Cell ${cellNumber}, empty`;
  }

  function getCellClasses(cell: Cell) {
    const baseClasses =
      "flex h-24 w-full items-center justify-center rounded-2xl border text-3xl font-bold shadow-sm transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70";

    if (cell === "X") {
      return `${baseClasses} border-blue-300 bg-blue-50 text-blue-700 hover:shadow-md dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 focus-visible:ring-blue-400`;
    }

    if (cell === "O") {
      return `${baseClasses} border-amber-300 bg-amber-50 text-amber-700 hover:shadow-md dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300 focus-visible:ring-amber-400`;
    }

    return `${baseClasses} border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus-visible:ring-emerald-400`;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tic-Tac-Toe
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            A quick break game for your study app
          </p>
        </div>

        <div
          className={`mb-5 rounded-2xl border px-4 py-3 text-center text-lg font-semibold ${
            isLocked
              ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
          }`}
          aria-live="polite"
        >
          {statusMessage}
        </div>

        <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          You have <span className="font-semibold">{availableTokens}</span> tokens.
          This game costs <span className="font-semibold">{requiredTokens}</span> tokens.
        </div>

        <div
          className={`grid grid-cols-3 gap-3 ${isLocked ? "pointer-events-none opacity-50" : ""}`}
          role="grid"
          aria-label="Tic-Tac-Toe board"
          aria-disabled={isLocked}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              ref={(element) => {
                cellRefs.current[index] = element;
              }}
              type="button"
              onClick={() => handleClick(index)}
              onKeyDown={(event) => handleCellKeyDown(event, index)}
              className={getCellClasses(cell)}
              disabled={
                isLocked || Boolean(cell) || Boolean(winner) || isDraw || !isPlayerTurn
              }
              aria-label={getCellLabel(cell, index)}
            >
              <span aria-hidden="true">{cell}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Use mouse clicks, Tab, Enter, Space, and arrow keys to play.
        </p>

<button
  type="button"
  onClick={resetGame}
  disabled={isProcessingReset || isProcessingUnlock || !hasEnoughTokens}
  className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:text-slate-950 dark:hover:bg-emerald-500"
>
  {isProcessingReset
    ? "Resetting..."
    : hasEnoughTokens
      ? `Reset Game (-${requiredTokens})`
      : `Need ${requiredTokens} tokens to reset`}
</button>
      </div>

      {showEntryModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-6">
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tictactoe-modal-title"
            aria-describedby="tictactoe-modal-description"
          >
            <h2
              id="tictactoe-modal-title"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Play Tic-Tac-Toe?
            </h2>

            <p
              id="tictactoe-modal-description"
              className="mt-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <span
                      className=""
                      title="You may only spend tokens that you have earned in this study session!"
                    >
                      ⓘ
                    </span>
              Starting a game will cost <span className="font-semibold">{requiredTokens}</span>{" "}
              session tokens.
              <br />
              You currently have <span className="font-semibold">{availableTokens}</span> session tokens.
            </p>

            {!hasEnoughTokens && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                You do not have enough tokens to play.
              </div>
              
            )}

            {unlockError && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                {unlockError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancelPlay}
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmPlay}
                disabled={!hasEnoughTokens || isProcessingUnlock}
                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessingUnlock ? "Starting..." : `Play (-${requiredTokens})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}