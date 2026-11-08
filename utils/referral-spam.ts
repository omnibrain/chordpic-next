import { GA4_ID } from "../global";

/** Referrer spam: bots that land with these referrers never engage. */
const SPAM_REFERRERS = ["aocr.org"];

const isSpamReferrer = (referrer: string) => {
  let host = "";
  try {
    host = new URL(referrer).hostname;
  } catch {}
  return SPAM_REFERRERS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
};

/**
 * Turns GA off for the whole browser session when it started from a spam
 * referrer, since later pages have our own site as referrer.
 */
export function disableAnalyticsForSpamReferrers() {
  let spam = isSpamReferrer(document.referrer);
  try {
    if (spam) sessionStorage.setItem("ga_spam", "1");
    else spam = !!sessionStorage.getItem("ga_spam");
  } catch {}
  if (spam) (window as any)[`ga-disable-${GA4_ID}`] = true;
}
