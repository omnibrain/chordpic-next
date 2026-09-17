import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runInNewContext } from "node:vm";
import type { SVGuitarChord } from "svguitar";
import type { Chart } from "../domain/chart";
import { toSvguitarChord, toSvguitarSettings } from "./chord-rendering";

export interface ChordDiagram {
  svg: string;
  width: number;
  height: number;
}

export const FREE_WATERMARK = "created with chordpic.com";

const fontDir = path.join(process.cwd(), "assets/fonts");
const umdBundle = path.join(
  process.cwd(),
  "node_modules/svguitar/dist/svguitar.umd.js",
);

/*
 * SVGuitar measures every label to lay a diagram out, so the server needs the
 * metrics the visitor's browser will use. Liberation Sans is metrically
 * identical to Arial, and Patrick Hand is the face SVGuitar itself embeds in
 * hand-drawn diagrams.
 */
const fontFiles = {
  Arial: "LiberationSans-Regular.ttf",
  Helvetica: "LiberationSans-Regular.ttf",
  "Helvetica Neue": "LiberationSans-Regular.ttf",
  "sans-serif": "LiberationSans-Regular.ttf",
  "Patrick Hand": "PatrickHand-Regular.ttf",
};

interface Renderer {
  document: Document;
  SVGuitarChord: typeof SVGuitarChord;
}

async function loadRenderer(): Promise<Renderer> {
  const svgdom = await import("svgdom");
  svgdom.config
    .setFontDir(fontDir)
    .setFontFamilyMappings(fontFiles)
    .preloadFonts();

  const window = svgdom.createSVGWindow();

  /*
   * SVGuitar bundles its own copy of svg.js, which reads `window` and
   * `document` once as it is evaluated and offers no way to hand it a window
   * afterwards. Importing it here would be no use: ChordChart imports SVGuitar
   * for the browser, the server evaluates that module too while React renders
   * the component, and whichever of the two got there first is the one module
   * both would share.
   *
   * So the bundle is run in a context of its own instead, where the globals it
   * reads on the way up are the svgdom window every draw below goes through.
   * The nodes still come from this realm, so svg.js's instanceof checks hold.
   */
  const sandbox: Record<string, unknown> = {
    window,
    document: window.document,
    self: window,
    module: { exports: {} },
    process,
    console,
  };
  sandbox.exports = (sandbox.module as { exports: unknown }).exports;
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;

  const source = await readFile(umdBundle, "utf8");
  runInNewContext(source, sandbox, { filename: umdBundle });

  return {
    document: window.document,
    SVGuitarChord: (sandbox.exports as { SVGuitarChord: typeof SVGuitarChord })
      .SVGuitarChord,
  };
}

let renderer: Promise<Renderer> | undefined;

/** Draw `chart` to standalone SVG markup, the way the browser would draw it. */
export async function renderChord(
  chart: Chart,
  watermark = FREE_WATERMARK,
): Promise<ChordDiagram> {
  renderer ??= loadRenderer();
  const { document, SVGuitarChord } = await renderer;

  const container = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  document.documentElement.appendChild(container);
  try {
    const { width, height } = new SVGuitarChord(container as never)
      .configure(toSvguitarSettings(chart.settings, watermark))
      .chord(toSvguitarChord(chart.chord))
      .draw();

    return { svg: container.outerHTML, width, height };
  } finally {
    container.remove();
  }
}
