import { sitemapEntries, SITE_URL } from "./seo";
import { buildSitemap } from "./sitemap";

describe("buildSitemap", () => {
  it("renders the entries as a valid urlset", async () => {
    const sitemap = await buildSitemap();

    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    );
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(sitemap.match(/<loc>/g)).toHaveLength(sitemapEntries().length);
    expect(sitemap).toContain(
      `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`,
    );
  });

  it("declares no namespace we do not emit", async () => {
    const sitemap = await buildSitemap();

    expect(sitemap).not.toContain("xmlns:news");
    expect(sitemap).not.toContain("xmlns:video");
    expect(sitemap).not.toContain("xmlns:image");
  });
});
