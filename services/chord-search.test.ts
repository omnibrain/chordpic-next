import { chordNames, chordVoicings } from "@svguitar/chords-plugin";
import { ChordStyle } from "@svguitar/core";
import {
  chartFromSearchResult,
  findChords,
  type Instrument,
} from "./chord-search";
import { ChordMatrix } from "./chord-matrix";

describe("findChords", () => {
  it("returns every voicing of the best match, then other chords that start with the search", () => {
    const results = findChords("Am", "guitar");

    expect(
      results.slice(0, 5).map(({ name, voicing }) => `${name} ${voicing}`),
    ).toEqual(["Am 0", "Am 1", "Am 2", "Am 3", "Am6 0"]);
    expect(results[0]).toMatchObject({
      name: "Am",
      instrument: "guitar",
      voicings: 4,
    });
    expect(results[0].chord.fingers).toContainEqual([4, 2, "2"]);
  });

  it("returns at most 24 chords", () => {
    expect(findChords("C", "guitar")).toHaveLength(24);
  });

  it("finds ukulele chords", () => {
    const [c] = findChords("C", "ukulele");

    expect(c).toMatchObject({ name: "C", instrument: "ukulele" });
    expect(c.chord.fingers).toEqual([
      [4, 0],
      [3, 0],
      [2, 0],
      [1, 3, "3"],
    ]);
  });

  it("returns nothing for unknown chords", () => {
    expect(findChords("H", "guitar")).toEqual([]);
    expect(findChords("", "guitar")).toEqual([]);
  });
});

describe("chartFromSearchResult", () => {
  const settings = {
    title: "Old",
    position: 3,
    strings: 7,
    frets: 6,
    color: "#f00",
    tuning: ["x"],
    style: ChordStyle.normal,
  };

  it("replaces the chord, title, starting fret, strings, frets and tuning", () => {
    const [f] = findChords("F", "guitar");

    expect(chartFromSearchResult(f, settings)).toEqual({
      chord: { fingers: f.chord.fingers, barres: f.chord.barres },
      settings: {
        ...settings,
        title: "F",
        position: 1,
        strings: 6,
        frets: 4,
        tuning: ["", "", "", "", "", ""],
      },
    });
  });

  it("uses the starting fret of chords higher up the neck", () => {
    const c = findChords("C", "guitar")[1];

    expect(chartFromSearchResult(c, settings).settings.position).toBe(3);
  });

  it("splits a barre across a muted or open string", () => {
    // fingers 1 and 1 on the outer strings around a muted A string
    const c6 = findChords("C6", "guitar")[3];
    expect(c6.chord.barres).toEqual([
      { fromString: 6, toString: 1, fret: 1, text: "1" },
    ]);

    const { chord } = chartFromSearchResult(c6, settings);

    expect(chord.fingers).toContainEqual([5, "x"]);
    expect(chord.fingers).toContainEqual([6, 1, "1"]);
    expect(chord.barres).toEqual([
      { fromString: 4, toString: 1, fret: 1, text: "1" },
    ]);
  });

  it("uses 4 strings for ukulele chords", () => {
    const [c] = findChords("C", "ukulele");

    expect(chartFromSearchResult(c, settings).settings).toMatchObject({
      strings: 4,
      tuning: ["", "", "", ""],
    });
  });

  it.each(["guitar", "ukulele"] as Instrument[])(
    "keeps every %s chord intact in the editor",
    (instrument) => {
      // the editor keeps a finger's text as { text }, which SVGuitar draws the same
      const sorted = (items: unknown[]) =>
        items
          .map((item) =>
            JSON.stringify(
              Array.isArray(item) && typeof item[2] === "string"
                ? [item[0], item[1], { text: item[2] }]
                : item,
            ),
          )
          .sort();

      chordNames(instrument).forEach((name) => {
        // a chord's own name finds all its voicings first
        findChords(name, instrument)
          .slice(0, chordVoicings(name, instrument))
          .forEach((result) => {
            const chart = chartFromSearchResult(result, settings);
            const edited = ChordMatrix.fromChart(chart).toVexchord();

            expect(result.name).toBe(name);
            expect([sorted(edited.fingers), sorted(edited.barres)]).toEqual([
              sorted(chart.chord.fingers),
              sorted(chart.chord.barres),
            ]);
          });
      });
    },
  );
});
