import { useEffect, useState } from "react";

const POLL_MS = 50;

type TcData = { eventStatus?: string; listenerId?: number };
type TcfApi = (
  command: string,
  version: number,
  callback: (data: TcData, success: boolean) => void,
  parameter?: unknown,
) => void;

function consentApi(): TcfApi | undefined {
  const api = (window as { __tcfapi?: unknown }).__tcfapi;
  return typeof api === "function" ? (api as TcfApi) : undefined;
}

/**
 * Whether the visitor's consent is settled: they answered the banner, answered
 * it on an earlier visit, or GDPR does not apply to them.
 *
 * AdSense reads consent from the IAB TCF API (`__tcfapi`) once, when it loads.
 * Loaded while the banner is still open, it never requests ads on that page
 * view, even after the visitor accepts. So ads wait until consent is settled,
 * and stay off if the banner never arrives.
 */
export function useConsentSettled(): boolean {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let listenerId: number | undefined;

    const listen = (api: TcfApi) =>
      api("addEventListener", 2, (data, success) => {
        if (!success) return;
        listenerId = data.listenerId;
        if (
          data.eventStatus === "tcloaded" ||
          data.eventStatus === "useractioncomplete"
        ) {
          setSettled(true);
        }
      });

    const id = window.setInterval(() => {
      const api = consentApi();
      if (api) {
        window.clearInterval(id);
        listen(api);
      }
    }, POLL_MS);

    return () => {
      window.clearInterval(id);
      if (listenerId !== undefined) {
        consentApi()?.("removeEventListener", 2, () => {}, listenerId);
      }
    };
  }, []);

  return settled;
}
