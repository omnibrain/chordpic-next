import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { utsLocaleToLanguage } from "@magic-translate/core";
import { PropsWithChildren } from "react";
import {
  adsInitScript,
  colorModeInitScript,
} from "../../hooks/init-scripts";
import { SiteChrome } from "../../components/SiteChrome";
import { PUBLIC_LOCALES } from "../../services/seo";
import { isRtl } from "../../utils/translate";
import { Providers } from "../providers";
import "../../styles/globals.css";

export function generateStaticParams() {
  return PUBLIC_LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" }],
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#da532c",
  },
};

export default async function RootLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  return (
    // Arabic, Persian and Urdu read right to left, so the layout has to be
    // mirrored and not merely translated. Tailwind's logical properties (ms-,
    // me-, text-start) follow this automatically; any remaining left/right
    // utility will not.
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      className={GeistSans.className}
      style={{ ["--font-geist-sans" as string]: GeistSans.style.fontFamily }}
    >
      <body>
        {/* Both have to run before paint, so they stay inline scripts rather
            than next/script — a flash of the wrong theme or of ads that should
            be hidden is exactly what they exist to prevent. */}
        <script dangerouslySetInnerHTML={{ __html: colorModeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: adsInitScript }} />
        <Providers language={utsLocaleToLanguage(locale)}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
        <Script
          id="cookieyes"
          type="text/javascript"
          strategy="lazyOnload"
          src="https://cdn-cookieyes.com/client_data/1b604b2eba7bd9fee27ccb84/script.js"
        />
        <Script
          id="rewardful-queue"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`,
          }}
        />
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
