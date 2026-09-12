import NextDocument, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { colorModeInitScript } from "../hooks/use-color-mode";
import { adsInitScript } from "../hooks/use-ads-assignment";
import { isRtl } from "../utils/translate";

export default class Document extends NextDocument {
  render() {
    // Was hardcoded to "en", so /de, /es and the rest all claimed to be
    // English. The body text is still translated client-side; this only fixes
    // the declaration browsers and screen readers act on.
    const locale = this.props.__NEXT_DATA__.locale ?? "en";

    return (
      // Arabic, Persian and Urdu read right to left, so the layout has to be
      // mirrored and not merely translated. Tailwind's logical properties (ms-,
      // me-, text-start) follow this automatically; any remaining left/right
      // utility will not.
      <Html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
        <Head>
          <Script
            id="cookieyes"
            type="text/javascript"
            strategy="lazyOnload"
            src="https://cdn-cookieyes.com/client_data/1b604b2eba7bd9fee27ccb84/script.js"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: colorModeInitScript }} />
          <script dangerouslySetInnerHTML={{ __html: adsInitScript }} />
          <Main />
          <NextScript />
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
      </Html>
    );
  }
}
