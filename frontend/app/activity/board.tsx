import { Board, Cell, N, Piece, Player } from "./movementTypes";

let nextId = 1;

export function makePiece(owner: Player, kind: Piece["kind"] = "man"): Piece {
  return {
    id: String(nextId++),
    owner,
    kind,
    hp: kind === "heavy" ? 2 : 
        kind === "block" ? 5 : 1,
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
        b[r][c] = makePiece("R", "man");
      }
    }
  }

  // Example special pieces so you can test:
  b[7][0] = makePiece("R", "king");
  b[5][2] = makePiece("R", "heavy");
  b[5][0] = makePiece("R", "knight");
  b[7][2] = makePiece("R", "cat");
  b[5][4] = makePiece("R", "beetle");
  b[5][6] = makePiece("R", "picasso");
  b[6][1] = makePiece("R", "alien");
  b[6][3] = makePiece("R", "soccerball");
  b[6][5] = makePiece("R", "basketball");
  return b;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}