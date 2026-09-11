import type { NextApiRequest, NextApiResponse } from "next";
import { buildSitemap } from "../../services/seo";

/**
 * Served at /sitemap.xml via a rewrite in next.config.js. It lives under /api
 * because `i18n` locale-prefixes every page route — a page would also answer at
 * /de/sitemap.xml, and would be subject to Accept-Language redirection. API
 * routes are exempt from both.
 *
 * Generated rather than checked in as a static file so it stays in step with
 * PUBLIC_PATHS and PUBLIC_LOCALES instead of quietly rotting.
 */
export default function sitemap(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400");
  res.status(200).send(buildSitemap());
}
