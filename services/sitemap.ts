import { Readable } from "node:stream";
import { ErrorLevel, SitemapStream, streamToPromise } from "sitemap";
import { sitemapEntries, SITE_URL } from "./seo";

/**
 * Server only — import this from the API route and nothing else. `sitemap`
 * reaches for node:path, node:readline and node:stream/promises, which webpack
 * cannot resolve for the browser, and ./seo.ts is reachable from the client
 * bundle through Layout and _app.
 */
export async function buildSitemap(): Promise<string> {
  const stream = new SitemapStream({
    hostname: SITE_URL,
    // Only the namespace the hreflang annotations need; the defaults also
    // declare news, video and image, none of which we emit.
    xmlns: { news: false, video: false, image: false, xhtml: true },
    // A malformed URL should fail the request rather than quietly ship a
    // sitemap Search Console will reject.
    level: ErrorLevel.THROW,
  });

  const xml = await streamToPromise(
    Readable.from(sitemapEntries()).pipe(stream),
  );

  return xml.toString();
}
