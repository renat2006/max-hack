import type { MaxInitData, MaxUser } from "./types";

export function parseInitData(initData: string): MaxInitData | null {
  if (!initData) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const result: MaxInitData = {
    auth_date: parseInt(params.get("auth_date") ?? "0", 10),
    hash: params.get("hash") ?? "",
  };

  const queryId = params.get("query_id");
  if (queryId) {
    result.query_id = queryId;
  }

  const userStr = params.get("user");
  if (userStr) {
    try {
      result.user = JSON.parse(decodeURIComponent(userStr)) as MaxUser;
    } catch {
      return null;
    }
  }

  const startParam = params.get("start_param");
  if (startParam) {
    result.start_param = startParam;
  }

  return result;
}

export function validateInitData(initData: MaxInitData): boolean {
  if (!initData?.hash) {
    return false;
  }

  return true;
}

export function isMaxWebApp(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return typeof window.Max !== "undefined";
}

export function getMaxBridge(): typeof window.Max | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Max ?? null;
}
