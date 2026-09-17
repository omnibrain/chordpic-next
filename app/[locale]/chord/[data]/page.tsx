import * as Sentry from "@sentry/nextjs";
import { createPageMetadata } from "@/services/app-metadata";
import { chartName, readChart } from "@/services/chord-link";
import { localizePathname } from "@/services/i18n";
import { serverTranslate } from "@/services/server-translate";
import { renderChord } from "@/services/chord-ssr";
import { Chart } from "@/domain/chart";
import ChordView from "./chord-view";

interface SharedChordProps {
  params: Promise<{ locale: string; data?: string }>;
}

export async function generateMetadata({ params }: SharedChordProps) {
  const { locale, data } = await params;

  return createPageMetadata(locale, "/chord", undefined, {
    name: chartName(readChart(data)),
    generatedImage: true,
  });
}

export default async function Page({ params }: SharedChordProps) {
  const { locale, data } = await params;
  const { T, t } = serverTranslate(locale);
  const chart = readChart(data);

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
