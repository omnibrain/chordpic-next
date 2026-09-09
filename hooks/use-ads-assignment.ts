import { useEffect, useState } from "react";
import { ADS_COOKIE, AdsArm } from "../services/feature-flags";

export interface AdsAssignment {
  /** What to actually do. Defaults to "on" so a missing cookie never costs revenue. */
  arm: AdsArm;
  /**
   * Whether the arm came from the server. Visitors without the cookie still see
   * ads, but must stay out of the analysis or they would all pile into the
   * control arm and bias it.
   */
  assigned: boolean;
}

const UNASSIGNED: AdsAssignment = { arm: "on", assigned: false };

/**
 * Browser-only. Safe to call from an effect, never during render.
 */
export function readAdsAssignment(): AdsAssignment {
  if (typeof document === "undefined") {
    return UNASSIGNED;
  }

  const value = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ADS_COOKIE}=`))
    ?.split("=")[1];

  if (value !== "on" && value !== "off") {
    return UNASSIGNED;
  }

  return { arm: value, assigned: true };
}

/**
 * Marks <html> with `ads-off` before hydration so copy that advertises the
 * absence of ads can be hidden with CSS instead of swapped in after mount,
 * which would visibly flash. Runs from _document, so it cannot import the
 * cookie name and repeats it literally — same trade-off as colorModeInitScript.
 */
export const adsInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )cp_ads=(on|off)/);if(m&&m[1]==="off"){document.documentElement.classList.add("ads-off")}}catch(e){}})()`;

/**
 * Null until after hydration. The value lives in a cookie the server set, and
 * the pages around it are statically generated, so reading it during the first
 * render would not match the prerendered HTML.
 */
export function useAdsAssignment(): AdsAssignment | null {
  const [assignment, setAssignment] = useState<AdsAssignment | null>(null);

  useEffect(() => {
    setAssignment(readAdsAssignment());
  }, []);

  return assignment;
}
