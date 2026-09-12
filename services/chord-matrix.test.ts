import { CellState, ChordMatrix, EmptyStringState } from "./chord-matrix";
import { FingerOptions, OPEN, SILENT } from "svguitar";
import { Chart } from "../domain/chart";
import { decompress } from "../hooks/compressed-state";
import { getLink } from "../hooks/url-state";

describe("Chord Matrix", () => {
  const numStrings = 3;
  const numFrets = 3;

  let matrix: ChordMatrix;

  beforeEach(() => {
    matrix = new ChordMatrix(numFrets, numStrings);
  });

  it("Toggles the state at the given position", () => {
    // when
    matrix.toggle(1, 1);

    // then
    expect(matrix.getCellState(1, 1)).toEqual(CellState.ACTIVE);
  });

  it("Correctly computes emtpy string states", () => {
    // when
    matrix.toggle(1, 1);

    // then
    expect(matrix.getEmptyStringStates()).toEqual([
      EmptyStringState.O,
      EmptyStringState.NOT_EMPTY,
      EmptyStringState.O,
    ]);
  });

  it("Should toggle the empty state", () => {
    // when
    matrix.toggleEmptyState(1);

    // then
    expect(matrix.getEmptyStringStates()[1]).toEqual(EmptyStringState.X);
  });

  it("Should correctly increase the numFrets", () => {
    // when
    matrix.setNumFrets(5);

    // then
    expect(matrix.rows).toHaveLength(5);
  });

  it("Should correctly initalize the cells when increasing the number of frets", () => {
    // when
    matrix.setNumFrets(4);

    // then
    matrix.rows.forEach((row) => {
      expect(row).toEqual([
        { state: CellState.INACTIVE },
        { state: CellState.INACTIVE },
        { state: CellState.INACTIVE },
      ]);
    });
  });

  it("Should correctly decrease the numFrets", () => {
    // when
    matrix.setNumFrets(2);

    // then
    expect(matrix.rows).toHaveLength(2);
  });

  it("Should correctly decrease the number of strings", () => {
    // when
    matrix.setNumStrings(2);

    // then
    expect(matrix.strings).toHaveLength(2);
  });

  it("Should correctly increase the number of strings", () => {
    // when
    matrix.setNumStrings(4);

    // then
    expect(matrix.strings).toHaveLength(4);
  });

  it('Should correctly "cut off" a barre chord when reducing the number of strings', () => {
    // when
    matrix.connect(0, 0, 2);
    matrix.print();
    matrix.setNumStrings(2);
    matrix.print();

    // then
    expect(matrix.rows[0].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.RIGHT,
    ]);
  });

  it("Should not leave holes in the matrix when a barre below the first fret is cut off", () => {
    // when
    matrix.connect(2, 0, 2);
    matrix.setNumStrings(2);

    // then
    expect(matrix.rows).toHaveLength(numFrets);
    matrix.rows.forEach((row) => {
      expect(row).toHaveLength(2);
      expect(row.filter((cell) => cell === undefined)).toEqual([]);
    });
    expect(() => matrix.getSections(2)).not.toThrow();
  });

  it("Should not create a barre end when the whole barre is cut off", () => {
    // given
    const wide = new ChordMatrix(1, 5);

    // when
    wide.connect(0, 2, 4);
    wide.setNumStrings(2);

    // then
    expect(wide.rows[0].map(({ state }) => state)).toEqual([
      CellState.INACTIVE,
      CellState.INACTIVE,
    ]);
    expect(wide.toBarres()).toEqual([]);
  });

  it("Should degrade a barre to a single finger when only its start survives", () => {
    // given
    const wide = new ChordMatrix(1, 4);

    // when
    wide.connect(0, 1, 3);
    wide.setNumStrings(2);

    // then
    expect(wide.rows[0].map(({ state }) => state)).toEqual([
      CellState.INACTIVE,
      CellState.ACTIVE,
    ]);
  });

  it("Should ignore a barre end that has no start instead of throwing", () => {
    // given
    const corrupt = new ChordMatrix(1, 2, [
      { state: CellState.INACTIVE },
      { state: CellState.RIGHT },
    ]);

    // then
    expect(corrupt.toBarres()).toEqual([]);
  });

  it("Should correctly compute empty strings after increasing the number of strings", () => {
    // when
    matrix.setNumStrings(4);

    // then
    expect(matrix.getEmptyStringStates()).toEqual([
      EmptyStringState.O,
      EmptyStringState.O,
      EmptyStringState.O,
      EmptyStringState.O,
    ]);
  });

  it("Should correctly keep the state when increasing the number of strings", () => {
    // when
    matrix.connect(0, 0, 2);
    matrix.connect(2, 0, 2);
    matrix.print();
    matrix.setNumStrings(4);
    matrix.print();

    // then
    expect(matrix.rows[0].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.MIDDLE,
      CellState.RIGHT,
      CellState.INACTIVE,
    ]);
    expect(matrix.rows[2].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.MIDDLE,
      CellState.RIGHT,
      CellState.INACTIVE,
    ]);
  });

  it("Should correcly render a chord array", () => {
    // when
    matrix.toggle(0, 0);
    matrix.toggle(1, 1);
    matrix.toggleEmptyState(2);

    matrix.print();

    // then
    expect(matrix.toChord()).toContainEqual([1, "x"]);
    expect(matrix.toChord()).toContainEqual([2, 2]);
    expect(matrix.toChord()).toContainEqual([3, 1]);
  });

  it("Should correctly set the state of connected cells", () => {
    // when
    matrix.connect(1, 0, 2);
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.MIDDLE,
      CellState.RIGHT,
    ]);
  });

  it("Should correctly set the state of connected cells (reversed)", () => {
    // when
    matrix.connect(1, 2, 0);
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.MIDDLE,
      CellState.RIGHT,
    ]);
  });

  it("Should correctly set the state of highlighted cells", () => {
    // when
    matrix.connectHighlight(1, 0, 2);
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.LEFT_HL,
      CellState.MIDDLE_HL,
      CellState.RIGHT_HL,
    ]);
  });

  it("Should correctly set the state of highlighted cells (reverse)", () => {
    // when
    matrix.connectHighlight(1, 2, 0);
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.LEFT_HL,
      CellState.MIDDLE_HL,
      CellState.RIGHT_HL,
    ]);
  });

  it("Should un-highlight cells on the same fret when highlighting other cells on the same fret", () => {
    // given
    matrix.connectHighlight(1, 0, 1);

    // when
    matrix.connectHighlight(1, 1, 2);
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.INACTIVE,
      CellState.LEFT_HL,
      CellState.RIGHT_HL,
    ]);
  });

  it("Should connect the highlighted strings", () => {
    // given
    matrix.connectHighlight(1, 0, 2);

    // when
    matrix.connectHighlighted();
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.MIDDLE,
      CellState.RIGHT,
    ]);
  });

  it("Should remove the connected cells when a string is toggled on the same fret", () => {
    // given
    matrix.connect(1, 0, 2);

    // when
    matrix.toggle(1, 1);
    matrix.print();

    // then
    expect(matrix.rows[1].map(({ state }) => state)).toEqual([
      CellState.INACTIVE,
      CellState.ACTIVE,
      CellState.INACTIVE,
    ]);
  });

  it("Should correctly convert to and from vexchord", () => {
    // given
    const settings = { frets: numFrets, strings: numStrings };
    matrix.toggle(0, 0);
    matrix.toggle(1, 1);
    matrix.text(1, 1, "A");
    matrix.color(1, 1, "blue");
    matrix.toggleEmptyState(2);
    matrix.connect(2, 0, 1);
    matrix.text(1, 2, "barre");
    matrix.print();

    ChordMatrix.fromChart({ chord: matrix.toVexchord(), settings }).print();

    // then
    expect(matrix.toVexchord()).toEqual(
      ChordMatrix.fromChart({
        chord: matrix.toVexchord(),
        settings,
      }).toVexchord()
    );
  });

  it("Should correctly convert to and from vexchord 2", () => {
    // given
    const settings = { frets: numFrets, strings: numStrings };
    matrix.connect(2, 0, 2);
    matrix.print();

    ChordMatrix.fromChart({ chord: matrix.toVexchord(), settings }).print();

    // then
    expect(matrix.toVexchord()).toEqual(
      ChordMatrix.fromChart({
        chord: matrix.toVexchord(),
        settings,
      }).toVexchord()
    );
  });

  it("Should correctly set colors", () => {
    // given
    matrix.toggle(1, 1);
    matrix.color(1, 1, "red");
    matrix.print();

    // then
    expect(matrix.toVexchord().fingers).toContainEqual([
      2,
      2,
      { color: "red" },
    ]);
  });

  it("Should correctly render barre chords", () => {
    // given
    matrix.connect(1, 0, 2);

    // then
    expect(matrix.toBarres()).toEqual([
      {
        fromString: 3,
        toString: 1,
        fret: 2,
      },
    ]);
  });

  it("Should allow setting a finger next to a barre chord", () => {
    // given
    matrix.connect(0, 0, 1);

    // when
    matrix.toggle(2, 0);
    matrix.print();

    // then
    expect(matrix.rows[0].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.RIGHT,
      CellState.ACTIVE,
    ]);
  });

  it("Should allow setting a barre chord next to a finger", () => {
    // given
    matrix.toggle(2, 0);

    // when
    matrix.connect(0, 0, 1);
    matrix.print();

    // then
    expect(matrix.rows[0].map(({ state }) => state)).toEqual([
      CellState.LEFT,
      CellState.RIGHT,
      CellState.ACTIVE,
    ]);
  });

  it('Should remove barre chords that are "cut off" from the left', () => {
    // given
    matrix.connect(0, 0, 1);
    matrix.print();

    // when
    matrix.connect(0, 1, 2);
    matrix.print();

    // then
    expect(matrix.rows[0].map(({ state }) => state)).toEqual([
      CellState.INACTIVE,
      CellState.LEFT,
      CellState.RIGHT,
    ]);
  });

  it("Should return the correct sections for barre chords", () => {
    // given
    matrix.connect(0, 0, 2);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      {
        empty: false,
        length: 3,
        string: 0,
      },
    ]);
  });

  it("Should return the correct sections for barre chords that don't start at string 0", () => {
    // given
    matrix.connect(0, 1, 2);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      {
        empty: true,
        length: 1,
        string: 0,
      },
      {
        empty: false,
        length: 2,
        string: 1,
      },
    ]);
  });

  it("Should return the correct sections for two consecutive barre chords", () => {
    // given
    matrix = new ChordMatrix(4, 4);
    matrix.connect(0, 0, 1);
    matrix.connect(0, 2, 3);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      {
        empty: false,
        length: 2,
        string: 0,
      },
      {
        empty: false,
        length: 2,
        string: 2,
      },
    ]);
  });

  it("Should return the correct sections for a centered barre chord", () => {
    // given
    matrix = new ChordMatrix(4, 4);
    matrix.connect(0, 1, 2);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      {
        empty: true,
        length: 1,
        string: 0,
      },
      {
        empty: false,
        length: 2,
        string: 1,
      },
      {
        empty: true,
        length: 1,
        string: 3,
      },
    ]);
  });

  it("Should return the correct sections for fingers", () => {
    // given
    matrix.toggle(0, 0);
    matrix.toggle(2, 0);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      { empty: false, length: 1, string: 0 },
      { empty: true, length: 1, string: 1 },
      { empty: false, length: 1, string: 2 },
    ]);
  });

  it("Should return the correct sections for consecutive fingers", () => {
    // given
    matrix.toggle(0, 0);
    matrix.toggle(1, 0);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      { empty: false, length: 1, string: 0 },
      { empty: false, length: 1, string: 1 },
      { empty: true, length: 1, string: 2 },
    ]);
  });

  it("Should return the correct sections a finger following a barre chord", () => {
    // given
    matrix.connect(0, 0, 1);
    matrix.toggle(2, 0);

    // when
    const lengths = matrix.getSections(0);

    // then
    expect(lengths).toEqual([
      { empty: false, length: 2, string: 0 },
      { empty: false, length: 1, string: 2 },
    ]);
  });

  it("Should clear all state from the finger when it is removed", () => {
    // given
    matrix.toggle(0, 0);
    matrix.text(0, 0, "foo");

    // when
    matrix.toggle(0, 0);

    // then
    expect(matrix.get(0, 0)).toEqual({
      state: CellState.INACTIVE,
    });
  });

  it("Should clear all state from the barre chord when it is removed", () => {
    // given
    matrix.connect(0, 0, 1);
    matrix.text(0, 0, "foo");

    // when
    matrix.toggle(0, 0);

    // then
    expect(matrix.rows[0]).toEqual([
      { state: CellState.ACTIVE },
      { state: CellState.INACTIVE },
      { state: CellState.INACTIVE },
    ]);
  });

  test.each`
    string | empty
    ${0}   | ${true}
    ${1}   | ${false}
    ${2}   | ${true}
  `("Computes correctly if string is empty", ({ string, empty }) => {
    matrix.toggle(1, 1);
    matrix.print();
    expect(matrix.isEmptyString(string)).toBe(empty);
  });

  describe("Open/silent string customization", () => {
    it("Should cycle through open -> silent -> hidden -> open", () => {
      expect(matrix.getEmptyStringStates()[0]).toEqual(EmptyStringState.O);

      matrix.toggleEmptyState(0);
      expect(matrix.getEmptyStringStates()[0]).toEqual(EmptyStringState.X);

      matrix.toggleEmptyState(0);
      expect(matrix.getEmptyStringStates()[0]).toEqual(EmptyStringState.NONE);

      matrix.toggleEmptyState(0);
      expect(matrix.getEmptyStringStates()[0]).toEqual(EmptyStringState.O);
    });

    it("Should not render a finger for a hidden empty string", () => {
      // when
      matrix.toggleEmptyState(0); // O -> X
      matrix.toggleEmptyState(0); // X -> NONE

      // then
      expect(matrix.toChord().some(([string]) => string === 3)).toBe(false);
    });

    it("Should allow setting text on an open string", () => {
      // when
      matrix.emptyStringText(0, "E");

      // then
      expect(matrix.getEmptyStringCells()[0]).toEqual({
        state: EmptyStringState.O,
        text: "E",
      });
      expect(matrix.toChord()).toContainEqual([3, 0, { text: "E" }]);
    });

    it.each([OPEN, SILENT])(
      "Should export and restore the outline color of an empty string (%s)",
      (value) => {
        if (value === SILENT) matrix.toggleEmptyState(1);
        matrix.emptyStringText(1, "R");
        matrix.emptyStringColor(1, "rgba(255, 0, 0, 0.5)");

        expect(matrix.toChord()).toContainEqual([
          2,
          value,
          { text: "R", strokeColor: "rgba(255, 0, 0, 0.5)" },
        ]);

        const restored = ChordMatrix.fromChart({
          chord: JSON.parse(JSON.stringify(matrix.toVexchord())),
          settings: { frets: numFrets, strings: numStrings },
        });
        expect(restored.getEmptyStringCells()[1]).toEqual(
          expect.objectContaining({ text: "R", color: "rgba(255, 0, 0, 0.5)" })
        );
        expect(restored.toVexchord()).toEqual(matrix.toVexchord());
      }
    );

    it.each([OPEN, SILENT])(
      "Should read legacy colors and prefer strokeColor for an empty string (%s)",
      (value) => {
        const options: FingerOptions[] = [
          { color: "red" },
          { strokeColor: "red" },
          { color: "blue", strokeColor: "red" },
        ];

        options.forEach((options) => {
          const restored = ChordMatrix.fromChart({
            chord: { fingers: [[2, value, options]], barres: [] },
            settings: { frets: numFrets, strings: numStrings },
          });

          expect(restored.getEmptyStringCells()[1].color).toBe("red");
          expect(restored.toChord()).toContainEqual([
            2,
            value,
            { strokeColor: "red" },
          ]);

          restored.emptyStringColor(1, "blue");
          expect(restored.toChord()).toContainEqual([2, value, { strokeColor: "blue" }]);
          restored.emptyStringColor(1, undefined);
          expect(restored.toChord()).toContainEqual([2, value]);
        });
      }
    );

    it("Should preserve text/color when cycling through states", () => {
      // when
      matrix.emptyStringText(0, "R");
      matrix.emptyStringColor(0, "blue");
      matrix.toggleEmptyState(0); // O -> X

      // then
      expect(matrix.getEmptyStringCells()[0]).toEqual({
        state: EmptyStringState.X,
        text: "R",
        color: "blue",
      });
    });

    it("Should correctly round-trip text/color on empty strings through vexchord", () => {
      // given
      const settings = { frets: numFrets, strings: numStrings };
      matrix.emptyStringText(0, "R");
      matrix.emptyStringColor(0, "blue");
      matrix.toggleEmptyState(1); // O -> X
      matrix.emptyStringText(1, "b3");

      // then
      expect(matrix.toVexchord()).toEqual(
        ChordMatrix.fromChart({
          chord: matrix.toVexchord(),
          settings,
        }).toVexchord()
      );
    });
  });

  describe("Hidden string persistence", () => {
    const settings = { frets: numFrets, strings: numStrings };

    function reload(matrixToSave: ChordMatrix) {
      return ChordMatrix.fromChart({
        chord: JSON.parse(JSON.stringify(matrixToSave.toVexchord())),
        settings: {
          frets: matrixToSave.numFrets,
          strings: matrixToSave.numStrings,
        },
      });
    }

    it.each([
      { hidden: [0, 2] },
      { hidden: [0, 1, 2] },
    ])("Should preserve hidden strings $hidden after saving and reloading", ({ hidden }) => {
      hidden.forEach((string) => {
        matrix.toggleEmptyState(string).toggleEmptyState(string);
      });

      const restored = reload(matrix);

      expect(restored.getEmptyStringStates()).toEqual(
        matrix.getEmptyStringStates()
      );
      expect(restored.toVexchord()).toEqual(matrix.toVexchord());
      expect(restored.toChord()).toHaveLength(numStrings - hidden.length);
    });

    it("Should restore a hidden marker's customization when it is made visible again", () => {
      matrix = ChordMatrix.fromChart({
        chord: {
          fingers: [
            [3, OPEN, { text: "R", strokeColor: "blue", textColor: "white" }],
          ],
          barres: [],
        },
        settings,
      });
      matrix.toggleEmptyState(0).toggleEmptyState(0);

      const restored = reload(matrix);
      expect(restored.getEmptyStringCells()[0]).toEqual({
        state: EmptyStringState.NONE,
        text: "R",
        color: "blue",
        textColor: "white",
      });

      restored.toggleEmptyState(0);
      expect(restored.toChord()).toContainEqual([
        3,
        OPEN,
        { text: "R", strokeColor: "blue", textColor: "white" },
      ]);
      expect(restored.toVexchord()).not.toHaveProperty("hiddenStrings");
    });

    it("Should preserve hidden strings when reopening a compressed sharing link for editing", () => {
      matrix.emptyStringText(1, "b3").emptyStringColor(1, "red");
      matrix.toggleEmptyState(1).toggleEmptyState(1);
      const chart: Chart = { chord: matrix.toVexchord(), settings };
      const link = getLink(chart, "/chord");
      const loaded = decompress<Chart>(link.slice(link.lastIndexOf("/") + 1));

      expect(loaded).toEqual(chart);
      const restored = ChordMatrix.fromChart(loaded!);
      expect(restored.getEmptyStringCells()[1]).toEqual({
        state: EmptyStringState.NONE,
        text: "b3",
        color: "red",
      });
      expect(restored.toVexchord()).toEqual(chart.chord);
    });

    it.each([undefined, OPEN, SILENT])(
      "Should keep legacy missing markers open and preserve explicit markers (%s)",
      (value) => {
        const restored = ChordMatrix.fromChart({
          chord: {
            fingers: value === undefined ? [] : [[2, value]],
            barres: [],
          },
          settings,
        });

        expect(restored.getEmptyStringStates()).toEqual([
          EmptyStringState.O,
          value === SILENT ? EmptyStringState.X : EmptyStringState.O,
          EmptyStringState.O,
        ]);
        expect(restored.toVexchord()).toEqual({
          fingers: [[3, OPEN], [2, value ?? OPEN], [1, OPEN]],
          barres: [],
        });
      }
    );

    it.each([OPEN, SILENT])(
      "Should prefer explicit visible markers over conflicting hidden metadata (%s)",
      (value) => {
        const chart = {
          chord: {
            fingers: [
              [2, value, { text: "E", strokeColor: "blue" }],
            ] as Chart["chord"]["fingers"],
            barres: [],
            hiddenStrings: [{ string: 2, text: "R", strokeColor: "red" }],
          },
          settings,
        };

        const restored = ChordMatrix.fromChart(chart);

        expect(restored.getEmptyStringCells()[1]).toEqual({
          state: value === OPEN ? EmptyStringState.O : EmptyStringState.X,
          text: "E",
          color: "blue",
        });
        expect(restored.toVexchord()).not.toHaveProperty("hiddenStrings");
      }
    );

    it("Should remember a hidden marker beneath a fretted note after reloading", () => {
      matrix.toggleEmptyState(0).toggleEmptyState(0);
      matrix.toggle(0, 1);

      const restored = reload(matrix);
      expect(restored.getEmptyStringStates()[0]).toBe(EmptyStringState.NOT_EMPTY);
      restored.toggle(0, 1);

      expect(restored.getEmptyStringStates()[0]).toBe(EmptyStringState.NONE);
      expect(restored.toChord().some(([string]) => string === 3)).toBe(false);
    });

    it("Should preserve retained hidden markers when resizing and discard removed strings", () => {
      matrix.toggleEmptyState(0).toggleEmptyState(0);
      matrix.toggleEmptyState(2).toggleEmptyState(2);
      matrix.setNumStrings(5);

      const expanded = reload(matrix);
      expect(expanded.getEmptyStringStates()).toEqual([
        EmptyStringState.NONE,
        EmptyStringState.O,
        EmptyStringState.NONE,
        EmptyStringState.O,
        EmptyStringState.O,
      ]);
      expect(expanded.toVexchord()).toEqual(
        expect.objectContaining({
          hiddenStrings: [{ string: 5 }, { string: 3 }],
        })
      );

      expanded.setNumStrings(2);
      const reduced = reload(expanded);
      expect(reduced.getEmptyStringStates()).toEqual([
        EmptyStringState.NONE,
        EmptyStringState.O,
      ]);
      expect(reduced.toVexchord()).toEqual(
        expect.objectContaining({ hiddenStrings: [{ string: 2 }] })
      );

      reduced.setNumStrings(3);
      expect(reload(reduced).getEmptyStringStates()).toEqual([
        EmptyStringState.NONE,
        EmptyStringState.O,
        EmptyStringState.O,
      ]);
    });
  });
});
