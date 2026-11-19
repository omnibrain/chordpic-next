import { useSyncExternalStore } from "react";

const BASE = "https://chordpic.invalid";
const offSite = /^[/\\]{2}/;

/**
 * Where to send a visitor after signing in: the `next` query parameter when it
 * is a path on this site, so it can't be used to redirect somewhere else.
 */
export function signInDestination(search: string, fallback = "/account") {
  const next = new URLSearchParams(search).get("next");
  // Browsers drop tabs and newlines from URLs, so "/\n/evil.com" would become "//evil.com"
  if (!next?.startsWith("/") || /[\u0000-\u001f\u007f]/.test(next)) {
    return fallback;
  }
  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return fallback;
  }
  const path = url.pathname + url.search + url.hash;
  return url.origin === BASE && !offSite.test(next) && !offSite.test(path)
    ? path
    : fallback;
}

const noSubscription = () => () => {};

/** The page's query string; empty while rendering on the server. */
export function useLocationSearch(): string {
  return useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => "",
  );
}
