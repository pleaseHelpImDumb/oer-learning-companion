import { Board, Cell, N, Piece, Player } from "./movementTypes";

let nextId = 1;

const RED_SPECIAL_TYPES: Piece["kind"][] = [
  "king",
  "cat",
  "knight",
  "heavy",
  "beetle",
  "picasso",
  "alien",
  "soccerball",
  "basketball",
];

function getRandomRedPieceKind(): Piece["kind"] {
  // 70% chance of a regular man, 30% chance of a special piece
  if (Math.random() < 0.5) {
    return "man";
  }

  const i = Math.floor(Math.random() * RED_SPECIAL_TYPES.length);
  return RED_SPECIAL_TYPES[i];
}

export function makePiece(owner: Player, kind: Piece["kind"] = "man"): Piece {
  return {
    id: String(nextId++),
    owner,
    kind,
    hp:
      kind === "heavy"
        ? 2
        : kind === "block"
        ? 2
        : 1,
    isKinged: false,
  };
}

export function makeInitialBoard(): Board {
  const b: Cell[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => null)
  );

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 1) {
        b[r][c] = makePiece("B", "man");
      }
    }
  }

  for (let r = N - 3; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 1) {
        b[r][c] = makePiece("R", getRandomRedPieceKind());
      }
    }
  }

  return b;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}