"use client";

import Script from "next/script";
import React, { PropsWithChildren, useEffect } from "react";
import { GA4_ID } from "../global";
import { SubscriptionType } from "../types";
import { useSubscription } from "../utils/useSubscription";
import {
  readAdsAssignment,
  useAdsAssignment,
} from "../hooks/use-ads-assignment";
import { NavBar, type NavLabels } from "./NavBar";

/**
 * What Layout used to be, minus its `<Head>`: the document metadata is now
 * `generateMetadata` on each page, and only the parts that need browser state
 * — the subscription, the ads arm, analytics — are left on the client.
 */
export const SiteChrome: React.FunctionComponent<
  PropsWithChildren<{ navLabels: NavLabels; footer: React.ReactNode }>
> = ({ children, navLabels, footer }) => {
  const subscription = useSubscription();
  const adsAssignment = useAdsAssignment();

  useEffect(() => {
    // Read straight from the cookie rather than from state: user properties
    // only apply to events sent after them, so this has to land before config.
    const ads = readAdsAssignment();

    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      dataLayer.push(arguments);
    }
    // @ts-ignore
    gtag("js", new Date());
    if (ads.assigned) {
      // @ts-ignore
      gtag("set", "user_properties", { ads_arm: ads.arm });
    }
    // @ts-ignore
    gtag("config", GA4_ID);
  }, []);

  return (
    <>
      {subscription === SubscriptionType.FREE &&
        adsAssignment?.arm === "on" && (
          <Script
            data-ad-client="ca-pub-5764824207547220"
            async
            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          />
        )}

      {subscription && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-QLVKP7R6W7"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA4_ID}', {debug: ${String(
            process.env.NODE_ENV !== "production",
          )}});
        `}
          </Script>
        </>
      )}

      <div className="flex min-h-screen flex-col">
        <NavBar labels={navLabels} />
        <main className="mx-auto mb-24 mt-10 w-full max-w-content flex-1 px-4 sm:px-6">
          {children}
        </main>
        {footer}
      </div>
    </>
  );
};
