import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import React, { PropsWithChildren, useEffect } from "react";
import { GA4_ID } from "../global";
import { PageMeta, SubscriptionType } from "../types";
import { useSubscription } from "../utils/useSubscription";
import {
  readAdsAssignment,
  useAdsAssignment,
} from "../hooks/use-ads-assignment";
import {
  DEFAULT_LOCALE,
  isNoindexPath,
  localeUrl,
  SITE_URL,
} from "../services/seo";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";

export interface LayoutProps {
  meta?: Partial<PageMeta>;
}

const TITLE_PREFIX = "ChordPic";

export const Layout: React.FunctionComponent<
  PropsWithChildren<LayoutProps>
> = ({ children, meta: pageMeta }) => {
  const router = useRouter();
  const subscription = useSubscription();
  const adsAssignment = useAdsAssignment();

  const meta = {
    title: `Free guitar chord diagram creator`,
    description: "It has never been easier to create beautiful chord diagrams.",
    cardImage: "/logo.png",
    ...pageMeta,
  };

  const fullTitle = [TITLE_PREFIX, meta.title].join(" | ");
  const noindex = isNoindexPath(router.asPath);
  // Skipped on noindex pages, which don't need one — and for the statically
  // optimised /chord/[...data] the server render has no params yet, so it would
  // be an URL with a literal "[...data]" in it.
  const canonical = noindex
    ? null
    : localeUrl(router.locale ?? DEFAULT_LOCALE, router.asPath);
  // Crawlers resolve og:image against nothing, so a site-relative path is a
  // broken card on every platform that renders one.
  const cardImage = `${SITE_URL}${meta.cardImage}`;

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
      <Head>
        <title>{fullTitle}</title>
        <meta
          name="robots"
          content={noindex ? "noindex, follow" : "index, follow"}
        />
        {canonical && <link rel="canonical" href={canonical} />}
        <link href="/favicon.ico" rel="shortcut icon" />
        <meta content={meta.description} name="description" />
        {canonical && <meta property="og:url" content={canonical} />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={TITLE_PREFIX} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:image" content={cardImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={cardImage} />
      </Head>

      {subscription === SubscriptionType.FREE && adsAssignment?.arm === "on" && (
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
              process.env.NODE_ENV !== "production"
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
