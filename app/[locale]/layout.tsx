import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { utsLocaleToLanguage } from "@magic-translate/core";
import { PropsWithChildren } from "react";
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
        <Providers language={utsLocaleToLanguage(locale)}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
