import NextDocument, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { colorModeInitScript } from "../hooks/use-color-mode";

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
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
          <script
            dangerouslySetInnerHTML={{ __html: colorModeInitScript }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
