/** @jest-environment node */

import type { ChordStyle } from "@svguitar/core";
import { Chart } from "../domain/chart";
import { PREVIEW_SIZE, renderChordPng } from "./chord-image";

const chart: Chart = {
  chord: { fingers: [[1, 2]], barres: [] },
  settings: { frets: 4, strings: 6, title: "Am" },
};

/** PNG dimensions live in the IHDR chunk, 16 bytes in. */
function pngSize(png: Buffer) {
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

it("draws the chord at the size the networks expect", async () => {
  expect(pngSize(await renderChordPng(chart))).toEqual(PREVIEW_SIZE);
});

it("draws the labels", async () => {
  // System fonts are switched off, so a font file that did not make it into
  // the deployment leaves resvg with nothing to draw text with — silently, and
  // the only trace of it is a title that renders exactly like no title at all.
  const titled = await renderChordPng(chart);
  const untitled = await renderChordPng({
    ...chart,
    settings: { ...chart.settings, title: "" },
  });

  expect(titled.equals(untitled)).toBe(false);
});

it("previews hand-drawn chords in the hand-drawn style", async () => {
  const handdrawn: Chart = {
    ...chart,
    settings: { ...chart.settings, style: "handdrawn" as ChordStyle },
  };
  const png = await renderChordPng(handdrawn);

  expect(pngSize(png)).toEqual(PREVIEW_SIZE);
  expect(png.equals(await renderChordPng(chart))).toBe(false);

  // Its labels are drawn in Patrick Hand, which resvg also has to find.
  const untitled = await renderChordPng({
    ...handdrawn,
    settings: { ...handdrawn.settings, title: "" },
  });
  expect(png.equals(untitled)).toBe(false);
});
