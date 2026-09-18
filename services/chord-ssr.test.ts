/** @jest-environment node */

import { Chart } from "../domain/chart";
import { renderChord } from "./chord-ssr";

const chart: Chart = {
  chord: {
    fingers: [
      [1, 2],
      [2, 3],
      [3, 3],
    ],
    barres: [],
  },
  settings: {
    fretSize: 1.75,
    frets: 4,
    strings: 6,
    showFretMarkers: false,
    title: "Am",
  },
};

it("draws a shared chord to standalone SVG markup", async () => {
  const { svg, width, height } = await renderChord(chart);

  expect(svg).toMatch(/^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  expect(svg).toContain("<title>Chord diagram created with chordpic.com</title>");
  expect(svg).toContain(">Am</tspan>");
  expect(svg).toContain("created with chordpic.com");
  expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`);

  // One circle per finger, plus the two corner markers SVGuitar always draws.
  expect(svg.match(/<circle/g)).toHaveLength(5);
});

it("lays the diagram out the way a browser would", async () => {
  // Chromium draws this chord 468.6 high. Server and browser round font
  // metrics differently, so they agree to about a pixel per text label and
  // never exactly; a bigger gap means the fonts below assets/fonts were not
  // found and every label was measured as empty.
  const { width, height } = await renderChord(chart);

  expect(width).toBe(400);
  expect(height).toBeGreaterThan(465);
  expect(height).toBeLessThan(475);
});

it("draws the starting fret label in the configured size and colour", async () => {
  const { svg } = await renderChord({
    ...chart,
    settings: {
      ...chart.settings,
      position: 5,
      fretLabelFontSize: 50,
      fretLabelColor: "#00ff00",
    },
  });

  const label = svg.match(/<text[^>]*class="fret-position"/)?.[0];
  expect(label).toContain('font-size="50"');
  expect(label).toContain('fill="#00ff00"');
});

it("leaves the Pro watermark out when asked to", async () => {
  const { svg } = await renderChord(chart, "");

  expect(svg).not.toContain("created with chordpic.com</tspan>");
});

it("renders without polluting the server's globals", async () => {
  await renderChord(chart);

  expect("window" in globalThis).toBe(false);
  expect("document" in globalThis).toBe(false);
});
