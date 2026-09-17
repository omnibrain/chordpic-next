import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import localFont from "next/font/local";
import type { CSSProperties, ReactNode } from "react";
import Providers from "../providers";
import { locales, isLocale } from "@/services/i18n";
import { isRtl } from "@/utils/translate";
import {
  adsInitScript,
  colorModeInitScript,
} from "@/services/document-scripts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    other: {
      rel: "mask-icon",
      url: "/safari-pinned-tab.svg",
      color: "#000000",
    },
  },
  manifest: "/site.webmanifest",
  other: { "msapplication-TileColor": "#da532c" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

/*
 * The same file geist/font/sans loads, declared here to get font-display:
 * optional, which the package hardcodes to swap.
 *
 * With optional the browser either has Geist ready within its block period or
 * keeps the fallback for the whole page view — it never swaps mid-view, so the
 * text cannot reflow. A metric-matched fallback only ever narrows that reflow,
 * and only for devices whose fallback metrics you guessed right.
 */
const geistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  weight: "100 900",
  display: "optional",
  fallback: ["system-ui", "arial", "sans-serif"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
      style={
        {
          fontFamily: geistSans.style.fontFamily,
          "--font-geist-sans": geistSans.style.fontFamily,
        } as CSSProperties
      }
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: colorModeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: adsInitScript }} />
        <Providers>{children}</Providers>
        <Script
          id="cookieyes"
          strategy="lazyOnload"
          src="https://cdn-cookieyes.com/client_data/1b604b2eba7bd9fee27ccb84/script.js"
        />
        <Script id="rewardful-queue" strategy="beforeInteractive">
          {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
        </Script>
        <Script
          id="rewardful"
          strategy="beforeInteractive"
          src="https://r.wdfl.co/rw.js"
          data-rewardful="014828"
        />
      </body>
    </html>
  );
}
