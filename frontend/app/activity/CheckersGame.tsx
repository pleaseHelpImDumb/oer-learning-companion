"use client";

import React, { useMemo, useState } from "react";

type Player = "R" | "B";
type Piece = { p: Player; k: boolean }; // k = king
type Cell = Piece | null;
type Pos = { r: number; c: number };
type Move = { to: Pos; cap?: Pos };

const N = 8;
const inBounds = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
const keyOf = (r: number, c: number) => `${r},${c}`;

function makeInitialBoard(): Cell[][] {
  const b: Cell[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => null)
  );
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { p: "B", k: false };
    }
  }
  for (let r = N - 3; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { p: "R", k: false };
    }
  }
  return b;
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function dirsFor(piece: Piece): Array<[number, number]> {
  const dirs: Array<[number, number]> = [];
  if (piece.k || piece.p === "R") dirs.push([-1, -1], [-1, 1]); // Red up
  if (piece.k || piece.p === "B") dirs.push([1, -1], [1, 1]); // Black down
  return dirs;
}

// Generate moves; when onlyCaptures=true, return only capture moves.
function genMoves(board: Cell[][], from: Pos, onlyCaptures = false): Move[] {
  const piece = board[from.r][from.c];
  if (!piece) return [];

  const moves: Move[] = [];

  for (const [dr, dc] of dirsFor(piece)) {
    const r1 = from.r + dr;
    const c1 = from.c + dc;
    if (!inBounds(r1, c1)) continue;

    // quiet move
    if (!onlyCaptures && !board[r1][c1]) {
      moves.push({ to: { r: r1, c: c1 } });
      continue;
    }

    // capture move
    const mid = board[r1][c1];
    if (mid && mid.p !== piece.p) {
      const r2 = from.r + 2 * dr;
      const c2 = from.c + 2 * dc;
      if (inBounds(r2, c2) && !board[r2][c2]) {
        moves.push({ to: { r: r2, c: c2 }, cap: { r: r1, c: c1 } });
      }
    }
  }

  return moves;
}

function hasCaptureFrom(board: Cell[][], from: Pos): boolean {
  return genMoves(board, from, true).length > 0;
}

function applyMove(board: Cell[][], from: Pos, mv: Move): { next: Cell[][]; landed: Pos } {
  const b = cloneBoard(board);
  const piece = b[from.r][from.c];
  if (!piece) return { next: board, landed: from };

  b[from.r][from.c] = null;
  b[mv.to.r][mv.to.c] = piece;

  if (mv.cap) b[mv.cap.r][mv.cap.c] = null;

  // King promotion
  if (!piece.k) {
    if (piece.p === "R" && mv.to.r === 0) piece.k = true;
    if (piece.p === "B" && mv.to.r === N - 1) piece.k = true;
  }

  return { next: b, landed: mv.to };
}

export default function CheckersGame() {
  const [board, setBoard] = useState<Cell[][]>(() => makeInitialBoard());
  const [turn, setTurn] = useState<Player>("R");
  const [selected, setSelected] = useState<Pos | null>(null);

  // NEW: when true, player must continue capturing with the selected piece
  const [mustContinueCapture, setMustContinueCapture] = useState(false);

  const [status, setStatus] = useState<string>("Red to move.");
  const [err, setErr] = useState<string>("");

  const legal = useMemo(() => {
    if (!selected) return new Map<string, Move>();
    const m = new Map<string, Move>();

    const moves = genMoves(board, selected, mustContinueCapture /* only captures during chain */);
    for (const mv of moves) m.set(keyOf(mv.to.r, mv.to.c), mv);

    return m;
  }, [board, selected, mustContinueCapture]);

  function reset() {
    setBoard(makeInitialBoard());
    setTurn("R");
    setSelected(null);
    setMustContinueCapture(false);
    setStatus("Red to move.");
    setErr("");
  }

  function onSquareClick(r: number, c: number) {
    setErr("");
    const cell = board[r][c];

    // If we have a selection and clicked a legal destination: move.
    if (selected) {
      const mv = legal.get(keyOf(r, c));
      if (mv) {
        const { next: nextBoard, landed } = applyMove(board, selected, mv);

        // If this move was a capture, check for more captures from the landing square
        if (mv.cap && hasCaptureFrom(nextBoard, landed)) {
          // Multi-jump continues: lock selection to this piece, capture-only
          setBoard(nextBoard);
          setSelected(landed);
          setMustContinueCapture(true);
          setStatus(
            `${turn === "R" ? "Red" : "Black"} must continue capturing (multi-jump available).`
          );
          return;
        }

        // Otherwise end turn
        const nextTurn: Player = turn === "R" ? "B" : "R";
        setBoard(nextBoard);
        setSelected(null);
        setMustContinueCapture(false);
        setTurn(nextTurn);
        setStatus(`${nextTurn === "R" ? "Red" : "Black"} to move.`);
        return;
      }
    }

    // During a capture chain: you may NOT select a different piece
    if (mustContinueCapture) {
      setErr("You must continue capturing with the selected piece.");
      return;
    }

    // Otherwise, try selecting a piece (must be current player's).
    if (cell && cell.p === turn) {
      setSelected({ r, c });
      const moves = genMoves(board, { r, c }, false);
      setStatus(
        moves.length
          ? `${turn === "R" ? "Red" : "Black"} selected. ${moves.length} move(s) available.`
          : `${turn === "R" ? "Red" : "Black"} selected. No legal moves.`
      );
      return;
    }

    // Clicking elsewhere clears selection (or shows quick error).
    if (selected) {
      setSelected(null);
      setStatus(`${turn === "R" ? "Red" : "Black"} to move.`);
    } else {
      setErr("Select one of your pieces to move.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-semibold">Turn: {turn === "R" ? "Red" : "Black"}</div>
          <div role="status" aria-live="polite" className="text-gray-700">
            {status}
          </div>
          {mustContinueCapture ? (
            <div className="text-xs text-gray-600">Capture chain active: capture-only moves.</div>
          ) : null}
          {err ? (
            <div role="alert" className="text-red-700">
              {err}
            </div>
          ) : null}
        </div>

        <button
          onClick={reset}
          className="ml-4 px-3 py-2 rounded-lg border border-black hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      <div
        className="grid grid-cols-8 border-2 border-black rounded-lg overflow-hidden"
        aria-label="Checkers board"
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = selected?.r === r && selected?.c === c;
            const isMove = legal.has(keyOf(r, c));

            const pieceLabel = cell
              ? `${cell.p === "R" ? "Red" : "Black"} ${cell.k ? "king" : "piece"}`
              : "Empty";

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSquareClick(r, c)}
                className={[
                  "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center",
                  dark ? "bg-[#3a3a3a]" : "bg-[#e6e6e6]",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#235937]",
                  isSel ? "ring-4 ring-yellow-300" : "",
                  isMove ? "ring-4 ring-blue-300" : "",
                  !dark ? "cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
                aria-label={`Row ${r + 1} Column ${c + 1}. ${pieceLabel}. ${
                  dark ? "Playable square." : "Light square (not used in checkers)."
                }`}
              >
                {cell ? (
                  <div
                    className={[
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center",
                      cell.p === "R" ? "bg-red-600" : "bg-black",
                      "border-2 border-white",
                      cell.k ? "outline outline-2 outline-yellow-300" : "",
                    ].join(" ")}
                    aria-hidden="true"
                    title={cell.k ? "King" : "Piece"}
                  >
                    {cell.k ? (
                      <span className="text-white text-xs sm:text-sm font-bold">K</span>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      <div className="text-xs text-gray-600 max-w-md text-center">
        MVP rules: diagonal moves, captures, kings, and <b>multi-jump captures</b>. (No forced
        capture at the start of a turn yet.)
      </div>
    </div>
  );
}