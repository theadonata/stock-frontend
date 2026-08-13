// Small typed fetch wrapper shared by every resource hook. Centralizing this
// means: (1) the backend base URL and /api/v1 prefix are configured once,
// (2) the JWT is attached consistently everywhere instead of per-call,
// (3) error handling / 401 redirect logic lives in one place.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const API_PREFIX = "/api/v1";

const TOKEN_STORAGE_KEY = "stock_auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// A typed error so callers (and the toast system) can distinguish "the
// network/server failed" from a validation problem, and show a useful message
// instead of a generic "something went wrong".
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // Skips attaching the Authorization header -- only used for the login call
  // itself, which happens before we have a token.
  skipAuth?: boolean;
}

// Fired when the backend returns 401, so the app-level auth state can react
// (clear the stored token, redirect to /login) without every call site having
// to check response.status itself.
export type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, skipAuth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch() itself throws on network failure (offline, DNS, CORS, etc.) --
    // normalize that into the same ApiError shape callers already handle.
    throw new ApiError(0, "Network error -- unable to reach the server.");
  }

  if (response.status === 401 && !skipAuth) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    // Backend uses FastAPI's default {"detail": "..."} error shape per the spec.
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") message = data.detail;
    } catch {
      // response body wasn't JSON -- fall back to the generic message above
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
