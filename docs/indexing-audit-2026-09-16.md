# Search Console duplicate URL audit — 2026-09-16

Input: `chordpic.com-Coverage-Drilldown-2026-09-16.zip`, issue **Duplicate without user-selected canonical**, 23 example URLs. The latest chart entry is September 14; the examples were last crawled June 21–September 11, before the September 16 App Router and News/Help server-translation deployments.

All 23 URLs were fetched from production on September 16 using a Googlebot user-agent, following redirects and inspecting actual HTML elements (excluding embedded React payloads). This checks what the server returns, not Google's current index or Google-selected canonical; those require Search Console URL Inspection. Embedded whitespace in exported sharing URLs was percent-encoded for the requests.

| Exported group | Count | Live result before this PR | Action |
| --- | ---: | --- | --- |
| Referral/tracking variants of `/`, `/es`, `/zh` | 6 | 200, query-free canonical in the HTML head | Already correct; retain tracking parameters and canonicalize them. |
| `/en/news`, `/en/about` | 2 | Redirect to unprefixed English URL with self-canonical | Already correct. |
| `/de/help`, `/fr/help` | 2 | Self-canonical in head, translated article in raw HTML | Already addressed by the Help migration. |
| `/de/about`, `/pt/languages`, `/nl/languages`, `/fr/pricing` | 4 | Self-canonical in head, but body copy still English before JavaScript | Translate these pages on the server in this PR. Preserve their same-language canonicals. |
| `/nl/terms`, `/hi/terms`, `/es/terms` | 3 | Identical English legal body; conflicting self-canonicals, 13 purported language alternatives and sitemap entries | Canonicalize every terms variant to `/terms`; publish only `/terms` in the sitemap and remove terms hreflang claims. Link the footer to `/terms`. Mark the legal body `lang="en" dir="ltr"`. |
| Shared chord state URLs | 4 | 200, `noindex, follow`, no canonical | Intentionally excluded. Keep crawlable so Google can read noindex. |
| `/de/chord/[...data]` | 1 | 200, `noindex, follow`, no canonical | Already excluded despite this malformed historical link; no reason to index a route placeholder. |
| `/en/signin` | 1 | Redirect to `/signin`, `noindex, follow`, no canonical | Intentionally excluded. |

The English legal terms are not translated. Existing localized terms URLs remain accessible with localized navigation; their canonical and Open Graph URL select the English document. Sitemap entries fall from 117 to 105. Public translated pages keep their full language alternatives. Noindex detection also now recognizes locale-prefixed auth/chord paths directly.

About and Languages use Magic Translate server components. Pricing renders its marketing copy, billing labels, free-card copy and paid-card description on the server. Translated labels are passed into the existing interactive paid card, preserving the original product name and price records used by subscription matching and checkout. The tabs and checkout remain client components. English copy skips translation requests; empty responses retain source text, matching News/Help.

Other routes' remaining client translations are outside this export-driven fix. These observations identify duplication risks, not proof of the reason for Google's decision on each URL. Google may render client translations, and canonical tags are signals rather than an indexing guarantee.

## After deployment

1. Inspect live `/de/about`, `/pt/languages`, `/fr/pricing` and `/nl/terms` in Search Console. Verify the translated HTML or English canonical respectively.
2. Resubmit `https://chordpic.com/sitemap.xml` and request indexing of representative canonical pages.
3. Run **Validate fix** on the duplicate report and monitor after recrawling. Query variants, localized terms, auth pages and shared chord URLs should remain excluded; success does not mean indexing all 23 examples. They may move to other expected exclusion categories.

Reference: [Google's canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) recommends aligning canonical tags, sitemap entries and internal links, and keeping duplicate URLs crawlable rather than using robots.txt to canonicalize them.
