import { SOCKET_IO_PATH } from "@/utils/publicApiConfig";

/**
 * Triggers a lightweight HTTP request through CloudFront to the socket origin
 * (Render) so the service can start waking before the user opens a channel.
 * Errors are ignored by design.
 */
export function requestSocketOriginWarmup(): void {
  if (typeof window === "undefined") return;
  if (window.location.hostname.includes("localhost")) return;

  const url = `${window.location.origin}${SOCKET_IO_PATH}/?EIO=4&transport=polling&t=${Date.now()}`;
  void fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  }).catch(() => {});
}
