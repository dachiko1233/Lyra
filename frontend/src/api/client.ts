/**
 * Backend API client.
 *
 * JWTs are held in memory (module-scoped) and injected via a setter from the
 * auth context — no localStorage/sessionStorage (per spec, dev artifacts keep
 * session in memory; production would use httpOnly cookies).
 */

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export interface Entitlements {
  max_messages_per_day: number;
  max_documents: number;
  priority: boolean;
  messages_remaining_today: number;
}

export interface Me {
  id: string;
  email: string;
  is_verified: boolean;
  plan: "free" | "pro";
  entitlements: Entitlements;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let resp: Response;
  try {
    resp = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is the backend running?");
  }

  if (!resp.ok) {
    let detail = `Request failed (${resp.status})`;
    try {
      const data = await resp.json();
      if (data?.detail) detail = typeof data.detail === "string" ? data.detail : detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(resp.status, detail);
  }

  if (resp.status === 204) return undefined as T;
  const contentType = resp.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) return resp.json() as Promise<T>;
  return resp.text() as unknown as Promise<T>;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  verify: (token: string) =>
    request<{ message: string }>(
      `/api/auth/verify?token=${encodeURIComponent(token)}`,
    ),

  login: (email: string, password: string) =>
    request<Tokens>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refresh_token: string) =>
    request<Tokens>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  me: () => request<Me>("/api/auth/me"),

  checkout: () =>
    request<{ checkout_url: string }>("/api/payments/checkout", {
      method: "POST",
    }),

  /**
   * Streamed chat. Calls `onToken` for each chunk of the grounded answer.
   * Returns the full text when the stream completes.
   */
  async chat(
    message: string,
    onToken: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const resp = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
      signal,
    });

    if (!resp.ok) {
      let detail = `Chat failed (${resp.status})`;
      try {
        const data = await resp.json();
        if (data?.detail) detail = data.detail;
      } catch {
        /* ignore */
      }
      throw new ApiError(resp.status, detail);
    }

    if (!resp.body) {
      const text = await resp.text();
      onToken(text);
      return text;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onToken(chunk);
    }
    return full;
  },
};
