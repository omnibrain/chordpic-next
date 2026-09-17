import "server-only";
import path from "node:path";
import { Chart } from "../domain/chart";
import { renderChord } from "./chord-ssr";

/** Open Graph's usual size; anything else gets cropped by the big networks. */
export const PREVIEW_SIZE = { width: 1200, height: 630 };

const PADDING = 24;

const fontDir = path.join(process.cwd(), "assets/fonts");
const fontFiles = [
  path.join(fontDir, "LiberationSans-Regular.ttf"),
  path.join(fontDir, "PatrickHand-Regular.ttf"),
];

/**
 * A chord diagram as a PNG, for the preview a shared link shows.
 *
 * The fonts are passed in and system fonts left switched off on purpose: the
 * host it renders on has no fonts to speak of, and resvg silently draws empty
 * boxes for every label rather than failing when it cannot find one.
 */
export async function renderChordPng(chart: Chart): Promise<Buffer> {
  const { svg } = await renderChord(chart);
  const { Resvg } = await import("@resvg/resvg-js");

  const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="${
    PREVIEW_SIZE.width
  }" height="${PREVIEW_SIZE.height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <svg x="${PADDING}" y="${PADDING}" width="${
    PREVIEW_SIZE.width - PADDING * 2
  }" height="${PREVIEW_SIZE.height - PADDING * 2}">${svg}</svg>
</svg>`;

  return Buffer.from(
    new Resvg(canvas, {
      font: {
        fontFiles,
        loadSystemFonts: false,
        defaultFontFamily: "Liberation Sans",
      },
    })
      .render()
      .asPng(),
  );
}
