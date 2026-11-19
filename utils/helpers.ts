import { Price } from "../types";

export const getURL = () => {
  const url =
    [
      process?.env?.URL,
      process?.env?.NEXT_PUBLIC_URL,
      process.env.VERCEL_URL,
      process.env.NEXT_PUBLIC_VERCEL_URL,
    ].find((u) => !!u) ?? "http://localhost:3000";

  return url.includes("http") ? url : `https://${url}`;
};

/**
 * Where Supabase sends people back after auth emails and OAuth: this deployment, so previews
 * return to themselves, and back to this sign-in page when it has a `next` destination to resume.
 */
export const getAuthRedirectURL = () => {
  if (typeof window === "undefined") return getURL();
  const { origin, pathname, search } = window.location;
  const next = new URLSearchParams(search).get("next");
  return next
    ? `${origin}${pathname}?${new URLSearchParams({ next })}`
    : origin;
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: {
    price: Price;
    analyticsClientId: string | null;
    referral?: string | null;
    coupon?: string | null;
  };
}) => {
  const res: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.log("Error in postData", { url, data, res });

    throw Error(res.statusText);
  }

  return res.json();
};

export const toDateTime = (secs: number) => {
  var t = new Date("1970-01-01T00:30:00Z"); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};
