import { CellState, ChordMatrix, EmptyStringState } from "./chord-matrix";

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
});
