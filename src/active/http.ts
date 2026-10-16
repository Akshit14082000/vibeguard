import type { FetchText } from "./types.js";

export const DEFAULT_TIMEOUT_MS = 5_000;

export function makeFetcher(timeoutMs = DEFAULT_TIMEOUT_MS): FetchText {
  const bounded = Math.max(100, Math.min(timeoutMs, 30_000));
  return async (url, init = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), bounded);
    try {
      // The scanner deliberately only issues the caller's GET requests.
      return await fetch(url, { ...init, method: "GET", signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}

export function localTarget(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Active target must be a valid http(s) URL"); }
  if (!/^https?:$/.test(url.protocol)) throw new Error("Active target must use http or https");
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname) || url.hostname.endsWith(".localhost");
  if (!local) throw new Error("Active scans are limited to local targets");
  return url;
}

export async function text(fetcher: FetchText, url: URL, headers?: HeadersInit): Promise<{ response: Response; body: string }> {
  const response = await fetcher(url, { headers });
  return { response, body: await response.text() };
}
