export type Player = "R" | "B";

export type Pos = {
  r: number;
  c: number;
};

export type PieceKind = "man" | "king" | "knight" | "heavy" | "cat" | "beetle" | "block" | "picasso" | "alien" | "basketball" | "soccerball";

export type Piece = {
  id: string;
  owner: Player;
  kind: PieceKind;
  hp: number;
  isKinged: boolean;
};

export type Cell = Piece | null;
export type Board = Cell[][];

export type Move = {
  to: Pos;
  captures?: Pos[];
};

export const N = 8;

export function inBounds(r: number, c: number) {
  return r >= 0 && r < N && c >= 0 && c < N;
}

export function keyOf(r: number, c: number) {
  return `${r},${c}`;
}

export const basePiece =
  "relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border-2 border-white rounded-full overflow-hidden";

export const kingPiece =
  "relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const knightPiece =
  "relative w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const pebble =
  "relative w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const cat =
  "relative w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const beetle =
  "relative w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const block =
  "relative w-20 h-20 sm:w-21 sm:h-21 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const picasso =
  "relative w-20 h-20 sm:w-21 sm:h-21 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const alien =
  "relative w-20 h-20 sm:w-21 sm:h-21 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const basketball =
  "relative w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";

export const soccerball =
  "relative w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden border-transparent bg-transparent rounded-none";
