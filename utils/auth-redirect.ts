import { useSyncExternalStore } from "react";

/**
 * Where to send a visitor after signing in: the `next` query parameter when it
 * is a path on this site, so it can't be used to redirect somewhere else.
 */
export function signInDestination(search: string, fallback = "/account") {
  const next = new URLSearchParams(search).get("next");
  return next && /^\/(?![/\\])/.test(next) ? next : fallback;
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
