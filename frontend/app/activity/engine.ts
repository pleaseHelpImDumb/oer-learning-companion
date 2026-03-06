import { Board, Move, N, Piece, Pos, inBounds } from "./movementTypes";
import { cloneBoard } from "./board";

function getDirs(piece: Piece): Array<[number, number]> {
  const isKingLike = piece.kind === "king" || piece.isKinged;

  const dirs: Array<[number, number]> = [];

  if (isKingLike || piece.owner === "R") {
    dirs.push([-1, -1], [-1, 1]);
  }

  if (isKingLike || piece.owner === "B") {
    dirs.push([1, -1], [1, 1]);
  }

  return dirs;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function wanderCat(board: Board, from: Pos): Pos {
  const piece = board[from.r][from.c];
  if (!piece || piece.kind !== "cat") return from;

  const moveOptions: Pos[] = shuffle([
    { r: from.r - 1, c: from.c - 1 },
    { r: from.r - 1, c: from.c + 1 },
    { r: from.r + 1, c: from.c - 1 },
    { r: from.r + 1, c: from.c + 1 },
  ]);

  for (const next of moveOptions) {
    if (!inBounds(next.r, next.c)) continue;
    if (board[next.r][next.c]) continue;

    board[from.r][from.c] = null;
    board[next.r][next.c] = piece;
    return next;
  }

  return from; // only stay if no move works
}

export function wanderAllCats(board: Board): Board {
  const b = cloneBoard(board);
  const cats: Pos[] = [];

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (b[r][c]?.kind === "cat") {
        cats.push({ r, c });
      }
    }
  }

  for (const pos of cats) {
    if (b[pos.r][pos.c]?.kind === "cat") {
      wanderCat(b, pos);
    }
  }
console.log("wandering cats...");
  return b;
}

function genCheckerMoves(board: Board, from: Pos, piece: Piece, onlyCaptures = false): Move[] {
  const moves: Move[] = [];

  for (const [dr, dc] of getDirs(piece)) {
    const r1 = from.r + dr;
    const c1 = from.c + dc;

    if (!inBounds(r1, c1)) continue;

    if (!onlyCaptures && !board[r1][c1]) {
      moves.push({ to: { r: r1, c: c1 } });
      continue;
    }

    const mid = board[r1][c1];
    if (mid && mid.owner !== piece.owner) {
      const r2 = from.r + dr * 2;
      const c2 = from.c + dc * 2;

      if (inBounds(r2, c2) && !board[r2][c2]) {
        moves.push({
          to: { r: r2, c: c2 },
          captures: [{ r: r1, c: c1 }],
        });
      }
    }
  }

  return moves;
}

function genKnightMoves(board: Board, from: Pos, piece: Piece, onlyCaptures = false): Move[] {
  const deltas = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1],
  ] as const;

  const moves: Move[] = [];

  for (const [dr, dc] of deltas) {
    const r = from.r + dr;
    const c = from.c + dc;

    if (!inBounds(r, c)) continue;

    const target = board[r][c];

    // normal knight move to empty square
    if (!target) {
      if (!onlyCaptures) {
        moves.push({ to: { r, c } });
      }
      continue;
    }

    // capture enemy on landing square
    if (target.owner !== piece.owner) {
      moves.push({
        to: { r, c },
        captures: [{ r, c }],
      });
    }
  }

  return moves;
}

function genBeetleMoves(board: Board, from: Pos, piece: Piece, onlyCaptures = false): Move[] {
  const deltas: Array<readonly [number, number]> = [];

  // forward jump
  if (piece.owner === "R") {
    deltas.push([-2, 0]);
  } else {
    deltas.push([2, 0]);
  }

  // backward jump only if kinged
  if (piece.isKinged) {
    if (piece.owner === "R") {
      deltas.push([2, 0]);
    } else {
      deltas.push([-2, 0]);
    }
  }

  const moves: Move[] = [];

  for (const [dr, dc] of deltas) {
    const r = from.r + dr;
    const c = from.c + dc;

    if (!inBounds(r, c)) continue;

    const target = board[r][c];

    // leap to empty square
    if (!target) {
      if (!onlyCaptures) {
        moves.push({ to: { r, c } });
      }
      continue;
    }

    // capture only what it lands on
    if (target.owner !== piece.owner) {
      moves.push({
        to: { r, c },
        captures: [{ r, c }],
      });
    }
  }

  return moves;
}

function genKingMoves(board: Board, from: Pos, piece: Piece, onlyCaptures = false): Move[] {
  const deltas = [
    [0,1],[1,0],[1,1],
    [0,-1],[-1,0],[-1,-1],
    [1,-1],[-1,1],
  ] as const;

  const moves: Move[] = [];

  for (const [dr, dc] of deltas) {
    const r = from.r + dr;
    const c = from.c + dc;

    if (!inBounds(r, c)) continue;

    const target = board[r][c];

    // normal knight move to empty square
    if (!target) {
      if (!onlyCaptures) {
        moves.push({ to: { r, c } });
      }
      continue;
    }

    // capture enemy on landing square
    if (target.owner !== piece.owner) {
      moves.push({
        to: { r, c },
        captures: [{ r, c }],
      });
    }
  }

  return moves;
}

export function genMoves(
  board: Board,
  from: Pos,
  onlyCaptures = false
): Move[] {
  const piece = board[from.r][from.c];
  if (!piece) return [];

  let moves: Move[] = [];

  switch (piece.kind) {
    case "knight":
      moves.push(...genKnightMoves(board, from, piece, onlyCaptures));
      break;

    case "king":
      moves.push(...genKingMoves(board, from, piece, onlyCaptures));
      break;

    case "beetle":
      moves.push(...genCheckerMoves(board, from, piece, onlyCaptures));
      moves.push(...genBeetleMoves(board, from, piece, onlyCaptures));
      break;

    default:
      moves.push(...genCheckerMoves(board, from, piece, onlyCaptures));
      break;
  }

  return moves;
}

export function hasCaptureFrom(board: Board, from: Pos): boolean {
  return genMoves(board, from, true).length > 0;
}

function damageOrRemove(board: Board, pos: Pos) {
  const victim = board[pos.r][pos.c];
  if (!victim) return;

  victim.hp -= 1;
  if (victim.hp <= 0) {
    board[pos.r][pos.c] = null;
  }
}

export function applyMove(
  board: Board,
  from: Pos,
  mv: Move
): { next: Board; landed: Pos } {
  const b = cloneBoard(board);
  const piece = b[from.r][from.c];
  if (!piece) return { next: board, landed: from };

  b[from.r][from.c] = null;

  for (const cap of mv.captures ?? []) {
    damageOrRemove(b, cap);
  }

  b[mv.to.r][mv.to.c] = piece;

  let finalLanded = mv.to;

  if (!piece.isKinged) {
    if (piece.owner === "R" && finalLanded.r === 0) {
      piece.isKinged = true;
    }
    if (piece.owner === "B" && finalLanded.r === N - 1) {
      piece.isKinged = true;
    }
  }

  return { next: b, landed: finalLanded };
}