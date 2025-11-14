export type GameStatus = "idle" | "success" | "error";

export type ErrorType = "missing" | "extra" | "both" | "empty";

export type ValidationResult =
  | { status: "success" }
  | { status: "error"; type: ErrorType; missing: number; extra: number };
