import * as Sentry from "@sentry/nextjs";
import {
  createPageMetadata,
  type LocalizedPageProps,
} from "@/services/app-metadata";
import { localizePathname } from "@/services/i18n";
import { serverTranslate } from "@/services/server-translate";
import { renderChord } from "@/services/chord-ssr";
import { decompress } from "@/hooks/compressed-state";
import { Chart } from "@/domain/chart";
import ChordView from "./chord-view";

interface SharedChordProps {
  params: Promise<{ locale: string; data?: string[] }>;
}

export async function generateMetadata({ params }: LocalizedPageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, "/chord");
}

export default async function Page({ params }: SharedChordProps) {
  const { locale, data } = await params;
  const { T, t } = serverTranslate(locale);
  const chart = readChart(data?.[0]);

  if (!chart) {
    return (
      <>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          <T>Invalid sharing link</T>
        </h1>
        <p className="mt-3 text-muted-foreground">
          <T>
            Sorry but this link does not seem to be a valid sharing link. Are
            you sure you have the complete link?
          </T>
        </p>
        <p className="mt-3">
          <T>
            Anyway, all you can do now is{" "}
            <a
              href={localizePathname("/", locale)}
              className="font-medium underline underline-offset-4"
            >
              go back and create a new guitar chord chart
            </a>
            .
          </T>
        </p>
      </>
    );
  }

  return (
    <ChordView
      chart={chart}
      diagram={await draw(chart)}
      editHeading={await t("Edit")}
      editLabel={await t("Edit this chord diagram")}
    />
  );
}

/**
 * The compressed chart, as the route hands it over.
 *
 * Percent-encoded, which matters: lz-string's alphabet includes `+`, and a `+`
 * reaches this as the three characters `%2B`. Decoding first is what makes the
 * majority of sharing links — any whose payload happens to contain one — work
 * at all.
 */
function readChart(segment?: string): Chart | null {
  if (!segment) return null;
  try {
    return decompress<Chart>(decodeURIComponent(segment));
  } catch {
    // A stray % is not a valid escape; the raw segment is the better guess.
    return decompress<Chart>(segment);
  }
}

/**
 * The chart comes out of the URL, so it can be anything at all. A settings
 * combination SVGuitar cannot draw should leave the page to the browser, which
 * has its own error boundary, rather than take the whole response down.
 */
async function draw(chart: Chart) {
  try {
    return await renderChord(chart);
  } catch (error) {
    Sentry.captureException(error, { extra: { chart } });
    return null;
  }
}
