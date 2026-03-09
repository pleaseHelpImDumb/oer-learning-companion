"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import kingSprite from "./assets/chess/king.png";
import knightSprite from "./assets/chess/knight.png";
import pebbleSprite from "./assets/misc/pebble.png";
import crackedPebbleSprite from "./assets/misc/crackedPebble.png";
import catSprite from "./assets/pets/cat.png";
import beetleSprite from "./assets/music/beetle.png";
import blockSprite from "./assets/misc/block.png";
import picassoSprite from "./assets/art/Picasso.png";
import alienSprite from "./assets/misc/alien.png";
import basketballSprite from "./assets/sports/basketball.png";
import soccerballSprite from "./assets/sports/soccerball.png";


import kingkingSprite from "./assets/kings/kingking.png";
import catkingSprite from "./assets/kings/catking.png";
import crackedPebblekingSprite from "./assets/kings/crackedpebbleking.png";
import pebblekingSprite from "./assets/kings/pebbleking.png";
import knightkingSprite from "./assets/kings/knightking.png";
import kingBeetleSprite from "./assets/kings/beetleking.png";

import { makeInitialBoard } from "./board";
import { applyMove, genMoves, hasCaptureFrom, wanderAllCats } from "./engine";
import {
  Board,
  Move,
  Player,
  Pos,
  keyOf,
  basePiece,
  kingPiece,
  knightPiece,
  pebble,
  cat,
  beetle,
  block,
  picasso,
  alien,
  basketball,
  soccerball,
} from "./movementTypes";

function getPieceClass(cell: NonNullable<Board[number][number]>) {
  const kingBorder = cell.isKinged
    ? "border-yellow-400 border-4"
    : "border-white border-2";

  switch (cell.kind) {
    case "king":
      return `${kingPiece}`;
    case "knight":
      return `${knightPiece}`;
    case "heavy":
      return `${pebble}`;
    case "cat":
      return `${cat}`;
    case "picasso":
      return `${picasso}`;
    case "beetle":
      return `${beetle}`;
    case "block":
      return `${block}`;
    case "alien":
      return `${alien}`;
    case "basketball":
      return `${basketball}`;
    case "soccerball":
      return `${soccerball}`;
    case "man":
    default:
      return `${basePiece} ${kingBorder} ${
        cell.owner === "R" ? "bg-red-600" : "bg-black"
      }`;
  }
}

function getPieceSprite(cell: NonNullable<Board[number][number]>) {
  if (cell.isKinged) {
    switch (cell.kind) {
      case "king":
        return kingkingSprite;
      case "knight":
        return knightkingSprite;
      case "cat":
        return catkingSprite;
      case "beetle":
        return kingBeetleSprite;
      case "heavy":
        return cell.hp > 1 ? pebblekingSprite : crackedPebblekingSprite;
      case "man":
      default:
        return null;
    }
  }

  switch (cell.kind) {
    case "king":
      return kingSprite;
    case "knight":
      return knightSprite;
    case "cat":
      return catSprite;
    case "beetle":
      return beetleSprite;
    case "block":
      return blockSprite;
    case "picasso":
      return picassoSprite;
    case "basketball":
      return basketballSprite;
    case "soccerball":
      return soccerballSprite;
    case "alien":
        return alienSprite;
    case "heavy":
      return cell.hp > 1 ? pebbleSprite : crackedPebbleSprite;
    case "man":
    default:
      return null;
  }
}

function getPieceInfo(cell: NonNullable<Board[number][number]>) {
  switch (cell.kind) {
    case "man":
      return {
        name: "Standard Piece",
        description:
          "A normal checker piece. Moves diagonally forward and captures by jumping. When kinged, it can move backward too.",
      };
    case "king":
      return {
        name: "King",
        description:
          "Moves like a chess king.",
      };
    case "knight":
      return {
        name: "Knight",
        description:
          "Moves like a chess knight in an L-shape.",
      };
    case "heavy":
      return {
        name: "Heavy",
        description:
          "The moon. Has a little extra HP. May be jumped once before cracking.",
      };
    case "cat":
      return {
        name: "Cat",
        description:
          "At the end of each player turn, the cat wanders to a random legal tile. It may immediately move away from where you place it.",
      };
    case "block":
      return {
        name: "Block",
        description:
          "Does nothing.",
      };
    case "beetle":
      return {
        name: "Beetle",
        description:
          "May jump forward 2 spaces. Landing on an enemy piece takes it. May also move like a regular piece.",
      };
    case "picasso":
      return {
        name: "Pablo Picasso",
        description:
          "Instead of jumping, he places cubes. Your team may jump over them, but the enemy cannot.",
      };
    case "alien":
      return {
        name: "Alien",
        description:
          "The mothership may carry them anywhere horizontally",
      };
    case "basketball":
      return {
        name: "Basketball",
        description:
          "Gains vertical movement when dribbled. To dribble: move forwards, then backwards.",
      };
    case "soccerball":
      return {
        name: "Soccerball",
        description:
          "May move however it wishes. However, it will recieve a red card and be ejected if it moves anywhere illegal.",
      };
    default:
      return {
        name: "Unknown Piece",
        description: "No description available.",
      };
  }
}

function getPieceDescription(cell: NonNullable<Board[number][number]>) {
  switch (cell.kind) {
    case "man":
      return {
        name: "Standard Piece",
        description:
          "A normal take on an old classic.",
      };
    case "king":
      return {
        name: "King",
        description:
          "He's a long way from home.",
      };
    case "knight":
      return {
        name: "Knight",
        description:
          "The horse is here.",
      };
    case "heavy":
      return {
        name: "Heavy",
        description:
          "Best kept away from the eyes.",
      };
    case "cat":
      return {
        name: "Cat",
        description:
          "She goes where she goes.",
      };
    case "beetle":
      return {
        name: "Beetle",
        description:
          "What's the buzz with the boogy-bug?",
      };
    case "block":
      return {
        name: "Block",
        description:
          "Talk about art block!",
      };
    case "picasso":
      return {
        name: "Pablo Picasso",
        description:
          "The king of cubism.",
      };
    case "alien":
      return {
        name: "Alien",
        description:
          "Straight from the BleepBlorp system!",
      };
    case "soccerball":
      return {
        name: "Soccerball",
        description:
          "Red cards all around!",
      };
    case "basketball":
      return {
        name: "Basketball",
        description:
          "WE are the goat.",
      };
    default:
      return {
        name: "Unknown Piece",
        description: "No description available.",
      };
  }
}

function canDoubleCapture(cell: NonNullable<Board[number][number]>) {
  switch (cell.kind) {
    case "king":
    case "knight":
    case "beetle":
    case "alien":
    case "soccerball":
      return false;

    case "cat":
    case "man":
    case "heavy":
    case "picasso":
    case "basketball":
    default:
      return true;
  }
}

export default function CheckersGame() {
  const [board, setBoard] = useState<Board>(() => makeInitialBoard());
  const [turn, setTurn] = useState<Player>("R");
  const [selected, setSelected] = useState<Pos | null>(null);
  const [mustContinueCapture, setMustContinueCapture] = useState(false);
  const [status, setStatus] = useState<string>("Red to move.");
  const [err, setErr] = useState<string>("");
  const [keyboardGridMode, setKeyboardGridMode] = useState(false);
  const [cursor, setCursor] = useState<Pos>({ r: 5, c: 0 });

  const boardRef = useRef<HTMLDivElement | null>(null);
  const squareRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedCell = selected ? board[selected.r][selected.c] : null;

  useEffect(() => {
    if (!keyboardGridMode) return;

    const index = cursor.r * 8 + cursor.c;
    squareRefs.current[index]?.focus();
  }, [keyboardGridMode, cursor]);

  function isPlayableSquare(r: number, c: number) {
    return (r + c) % 2 === 1;
  }

function moveCursor(dr: number, dc: number) {
  setCursor((prev) => {
    let nr = prev.r;
    let nc = prev.c;

    do {
      nr += dr;
      nc += dc;
    } while (
      nr >= 0 &&
      nr < 8 &&
      nc >= 0 &&
      nc < 8 &&
      !isPlayableSquare(nr, nc)
    );

    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) {
      return prev;
    }

    return { r: nr, c: nc };
  });
}

function enterKeyboardGridMode() {
  setKeyboardGridMode(true);

  setCursor((prev) => {
    if (selected) return selected;
    if (isPlayableSquare(prev.r, prev.c)) return prev;
    return { r: 5, c: 0 };
  });
}

function exitKeyboardGridMode() {
  setKeyboardGridMode(false);
}
  const legal = useMemo(() => {
    if (!selected) return new Map<string, Move>();

    const m = new Map<string, Move>();
    const moves = genMoves(board, selected, mustContinueCapture);

    for (const mv of moves) {
      m.set(keyOf(mv.to.r, mv.to.c), mv);
    }

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

    // move if clicked legal destination
    if (selected) {
      const mv = legal.get(keyOf(r, c));

      if (mv) {
        const { next, landed } = applyMove(board, selected, mv);

        if ((mv.captures?.length ?? 0) > 0) {
          const movedPiece = next[landed.r][landed.c];

          if (
            movedPiece &&
            movedPiece.kind !== "king" &&
            movedPiece.kind !== "knight" &&
            movedPiece.kind !== "beetle" &&
            hasCaptureFrom(next, landed)
          ) {
            setBoard(next);
            setSelected(landed);
            setMustContinueCapture(true);
            setStatus(
              `${turn === "R" ? "Red" : "Black"} must continue capturing.`
            );
            return;
          }
        }

        const nextTurn: Player = turn === "R" ? "B" : "R";
        const finalBoard = turn === "R" ? wanderAllCats(next) : next;

        setBoard(finalBoard);
        setSelected(null);
        setMustContinueCapture(false);
        setTurn(nextTurn);
        setStatus(`${nextTurn === "R" ? "Red" : "Black"} to move.`);
        return;
      }
    }

    if (mustContinueCapture) {
      setErr("You must continue capturing with the selected piece.");
      return;
    }

    if (cell && cell.owner === turn) {
      setSelected({ r, c });
      const moves = genMoves(board, { r, c }, false);
      setStatus(
        moves.length
          ? `${turn === "R" ? "Red" : "Black"} selected. ${moves.length} move(s) available.`
          : `${turn === "R" ? "Red" : "Black"} selected. No legal moves.`
      );
      return;
    }

    if (selected) {
      setSelected(null);
      setStatus(`${turn === "R" ? "Red" : "Black"} to move.`);
    } else {
      setErr("Select one of your pieces to move.");
    }
  }

  const pieceInfo = selectedCell ? getPieceInfo(selectedCell) : null;
  const piecedescription = selectedCell ? getPieceDescription(selectedCell) : null;
function onBoardKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
  if (!keyboardGridMode) return;

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      moveCursor(-1, 0);
      return;
    case "ArrowDown":
      e.preventDefault();
      moveCursor(1, 0);
      return;
    case "ArrowLeft":
      e.preventDefault();
      moveCursor(0, -1);
      return;
    case "ArrowRight":
      e.preventDefault();
      moveCursor(0, 1);
      return;
    case "Enter":
    case " ":
      e.preventDefault();
      onSquareClick(cursor.r, cursor.c);
      return;
    case "Escape":
      e.preventDefault();
      exitKeyboardGridMode();
      return;
  }
}
return (
  <div className="px-3 py-3">
    <div className="flex flex-col md:flex-row items-start gap-6 min-h-screen">
      {/* Left menu */}
<aside className="w-full md:w-80 lg:w-96 shrink-0 rounded-xl border-2 border-black bg-white p-6 shadow-sm md:min-h-[85vh]">
  <h2 className="text-2xl font-bold mb-4">Piece Info</h2>

  {selectedCell ? (
    <div className="space-y-4">
      <div>
        <div className="text-base text-gray-500">Selected</div>
        <div className="text-xl font-semibold">
          {selectedCell.owner === "R" ? "Red" : "Black"}{" "}
          {pieceInfo?.name === "Heavy" ? "Moon" : pieceInfo?.name}
        </div>
      </div>

      <div className="text-base text-gray-700 leading-relaxed">
        {piecedescription?.description}
      </div>

      <div className="border-t border-gray-700"></div>

      <div className="text-base text-gray-700 leading-relaxed">
        {pieceInfo?.description}
      </div>

      <div className="text-base space-y-2 border-t pt-4">
        <div>
          <span className="font-semibold">Type:</span>{" "}
          {selectedCell.kind === "heavy" ? "Moon" : selectedCell.kind}
        </div>
        <div>
          <span className="font-semibold">HP:</span> {selectedCell.hp}
        </div>
        <div>
          <span className="font-semibold">Double Capture:</span>{" "}
          {canDoubleCapture(selectedCell) ? "Yes" : "No"}
        </div>
        <div>
          <span className="font-semibold">Kinged:</span>{" "}
          {selectedCell.isKinged ? "Yes" : "No"}
        </div>
        <div>
          <span className="font-semibold">Position:</span>{" "}
          Row {selected!.r + 1}, Column {selected!.c + 1}
        </div>
      </div>
    </div>
  ) : (
    <div className="text-base text-gray-600 leading-relaxed">
      Click one of your pieces to see its description here.
    </div>
  )}

  <div className="text-base space-y-3 border-t pt-4 mt-6">
    <div className="font-semibold text-lg">Keyboard Controls</div>

    <button
      type="button"
      onClick={enterKeyboardGridMode}
      className="w-full px-4 py-3 rounded-lg border border-black bg-gray-50 hover:bg-gray-100 text-left"
    >
      Enable Arrow Key Grid Control
    </button>

    <button
      type="button"
      onClick={exitKeyboardGridMode}
      className="w-full px-4 py-3 rounded-lg border border-black bg-gray-50 hover:bg-gray-100 text-left"
    >
      Exit Arrow Key Grid Control
    </button>

    <div className="text-sm text-gray-600 leading-relaxed">
      When enabled, use arrow keys to move around the board, Enter or Space to
      activate a square, and Escape to leave this mode.
    </div>

    <div className="text-sm">
      <span className="font-semibold">Mode:</span>{" "}
      {keyboardGridMode ? "Arrow key grid control active" : "Standard navigation"}
    </div>
  </div>
</aside>
      {/* Main game area */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-base">
            <div className="text-xl font-semibold">
              Turn: {turn === "R" ? "Red" : "Black"}
            </div>
            <div role="status" aria-live="polite" className="text-gray-700 text-base">
              {status}
            </div>
            {mustContinueCapture ? (
              <div className="text-sm text-gray-600">
                Capture chain active: capture-only moves.
              </div>
            ) : null}
            {err ? (
              <div role="alert" className="text-red-700 text-sm">
                {err}
              </div>
            ) : null}
          </div>

          <button
            onClick={reset}
            className="ml-4 px-5 py-3 text-base rounded-lg border border-black hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
<div
  ref={boardRef}
  onKeyDown={onBoardKeyDown}
  className="grid grid-cols-8 border-2 border-black rounded-lg overflow-hidden"
  aria-label="Checkers board"
  role="grid"
  aria-roledescription="checkers board"
  aria-describedby="board-keyboard-help"
>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const dark = (r + c) % 2 === 1;
              const isSel = selected?.r === r && selected?.c === c;
              const isMove = legal.has(keyOf(r, c));
const isCursor = cursor.r === r && cursor.c === c;
const squareIndex = r * 8 + c;
              const pieceLabel = cell
                ? `${cell.owner === "R" ? "Red" : "Black"} ${cell.kind}${
                    cell.isKinged ? " kinged" : ""
                  } with ${cell.hp} HP`
                : "Empty";

              return (
                <button
                  key={`${r}-${c}`}
  ref={(el) => {
    squareRefs.current[squareIndex] = el;
  }}
  onClick={() => onSquareClick(r, c)}
  tabIndex={
    keyboardGridMode
      ? isCursor
        ? 0
        : -1
      : dark
      ? 0
      : -1
  }
                  
                  className={[
                    "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center",
                    dark ? "bg-[#3a3a3a]" : "bg-[#e6e6e6]",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#235937]",
                    isSel ? "ring-4 ring-yellow-300" : "",
                    isMove ? "ring-4 ring-blue-300" : "",
                    !dark ? "cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                  aria-label={`Row ${r + 1} Column ${c + 1}. ${pieceLabel}. ${
                    dark ? "Playable square." : "Light square."
                  }`}
                >
                  {cell ? (
                    <div className={getPieceClass(cell)} aria-hidden="true">
                      {(() => {
                        const sprite = getPieceSprite(cell);

                        return (
                          <>
                            {sprite && (
                              <Image
                                src={sprite}
                                alt={`${cell.kind}${cell.isKinged ? " kinged" : ""}`}
                                fill
                                className="object-contain [image-rendering:pixelated]"
                              />
                            )}

                            {cell.kind === "man" && cell.isKinged && (
                              <div className="absolute text-yellow-400 text-sm font-bold">
                                K
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
<div id="board-keyboard-help" className="sr-only">
  In arrow key grid control mode, use the arrow keys to move between playable
  squares. Press Enter or Space to activate a square. Press Escape to leave
  arrow key mode.
</div>
        <div className="text-sm text-gray-600 max-w-xl text-center">
          Supports regular pieces, kings, knight movement pieces, heavy pieces with
          extra HP, and multi-jump captures.
        </div>
      </div>
    </div>
  </div>
);
}