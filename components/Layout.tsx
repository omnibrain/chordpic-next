"use client";

import Script from "next/script";
import React, { PropsWithChildren, useEffect } from "react";
import { GA4_ID } from "../global";
import { SubscriptionType } from "../types";
import { useSubscription } from "../utils/useSubscription";
import { useConsentSettled } from "../hooks/use-consent-settled";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";
import { disableAnalyticsForSpamReferrers } from "../utils/referral-spam";

// Before anything below configures gtag.
if (typeof window !== "undefined") disableAnalyticsForSpamReferrers();

export const Layout = ({ children }: PropsWithChildren) => {
  const subscription = useSubscription();
  const consentSettled = useConsentSettled();

  useEffect(() => {
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      dataLayer.push(arguments);
    }
    // @ts-ignore
    gtag("js", new Date());
    // @ts-ignore
    gtag("config", GA4_ID);
  }, []);

  return (
    <>
      {subscription === SubscriptionType.FREE && consentSettled && (
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
        <NavBar />
        <main className="mx-auto mb-24 mt-10 w-full max-w-content flex-1 px-4 sm:px-6">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};
