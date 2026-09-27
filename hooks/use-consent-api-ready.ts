import { useEffect, useState } from "react";

const POLL_MS = 50;

function hasConsentApi() {
  return typeof (window as { __tcfapi?: unknown }).__tcfapi === "function";
}

/**
 * Whether the consent banner has installed the IAB TCF API (`__tcfapi`).
 *
 * AdSense reads consent from that API when it loads, and without it EEA
 * visitors get ad requests with no consent attached. So ads wait for it, and
 * stay off if the banner never arrives.
 */
export function useConsentApiReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (hasConsentApi()) {
        window.clearInterval(id);
        setReady(true);
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  return ready;
}
