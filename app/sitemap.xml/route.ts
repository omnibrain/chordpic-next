import { buildSitemap } from "../../services/sitemap";

/**
 * Was pages/api/sitemap.ts behind a rewrite in next.config.js, which existed
 * only so `i18n` would not locale-prefix it. Nothing prefixes route handlers,
 * so it can sit at its real path now and the rewrite is gone.
 *
 * Generated rather than checked in as a static file so it stays in step with
 * PUBLIC_PATHS and PUBLIC_LOCALES instead of quietly rotting.
 */
export async function GET() {
  return new Response(await buildSitemap(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}
