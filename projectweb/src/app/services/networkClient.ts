import { API_URLS } from "./config";

export class ApiError extends Error {
  status: number;
  offline: boolean;

  constructor(message: string, status = 0, offline = false) {
    super(message);
    this.status = status;
    this.offline = offline;
  }
}

let serverReachable = true;
const listeners = new Set<(reachable: boolean) => void>();

function notifyReachability(value: boolean): void {
  if (serverReachable === value) return;
  serverReachable = value;
  listeners.forEach((listener) => listener(value));
}

export function isServerReachable(): boolean {
  return serverReachable;
}

export function subscribeServerReachability(listener: (reachable: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      notifyReachability(true);

      let message = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        if (typeof errorBody?.error === "string") {
          message = errorBody.error;
        }
      } catch (_error) {
        // ignore parse errors
      }

      throw new ApiError(message, response.status, false);
    }

    notifyReachability(true);
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    notifyReachability(false);
    throw new ApiError("Server unreachable or network offline", 0, true);
  }
}

export async function pingServer(): Promise<boolean> {
  try {
    await apiRequest<{ status: string }>(API_URLS.health);
    return true;
  } catch (_error) {
    return false;
  }
}
