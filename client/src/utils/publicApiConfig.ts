/** Passed to `io()` as the server URL (origin only). */
function httpOrigin(): string {
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost")
  ) {
    return "http://localhost:3000";
  }
  return typeof window !== "undefined" ? window.location.origin : "";
}

/** Axios `baseURL` — same host as API routes under `/api`. */
export function getApiUrl(): string {
  const o = httpOrigin();
  return o ? `${o}/api` : "/api";
}

/** Socket.IO server URL (origin only). Pair with {@link SOCKET_IO_PATH}. */
export function getSocketUrl(): string {
  return httpOrigin();
}

export const SOCKET_IO_PATH = "/api/socket.io" as const;
