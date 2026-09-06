import { ChordStyle, OPEN, Orientation, SILENT, SVGuitarChord } from "svguitar";
import { EditableChord } from "../domain/chart";
import { ChordMatrix } from "./chord-matrix";
import { toSvguitarChord } from "./chord-rendering";

describe("Open/silent string rendering", () => {
  const originalGetBBox = Object.getOwnPropertyDescriptor(
    SVGElement.prototype,
    "getBBox",
  );

  beforeAll(() => {
    // jsdom has no SVG layout. Color assertions only need SVGuitar to finish drawing.
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    });
  });

  afterAll(() => {
    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, "getBBox", originalGetBBox);
    } else {
      Reflect.deleteProperty(SVGElement.prototype, "getBBox");
    }
  });

  afterEach(() => {
    document.getElementById("test-chord-diagram")?.remove();
  });

  test.each([Orientation.vertical, Orientation.horizontal])(
    "renders custom marker colors and preserves defaults in %s diagrams",
    (orientation) => {
      const matrix = new ChordMatrix(3, 4);
      matrix.emptyStringColor(0, "#0000ff");
      matrix.toggleEmptyState(1).emptyStringColor(1, "#ff0000");
      matrix.toggleEmptyState(3);

      // SVGuitar's Node renderer expects an existing SVG root.
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "test-chord-diagram";
      document.body.appendChild(svg);
      const chart = new SVGuitarChord("#test-chord-diagram")
        .configure({ strings: 4, frets: 3, color: "#123456", orientation })
        .chord(toSvguitarChord(matrix.toVexchord()));

      chart.draw();

      expect(svg.querySelector(".open-string-0")?.getAttribute("stroke")).toBe(
        "#0000ff",
      );
      expect(svg.querySelector(".open-string-2")?.getAttribute("stroke")).toBe(
        "#123456",
      );

      // SVGuitar 2.4.1 does not attach classes to lines; only X markers are diagonal.
      const silentMarkerStrokes = Array.from(svg.querySelectorAll("line"))
        .filter(
          (line) =>
            line.getAttribute("x1") !== line.getAttribute("x2") &&
            line.getAttribute("y1") !== line.getAttribute("y2"),
        )
        .map((line) => line.getAttribute("stroke"));
      expect(silentMarkerStrokes).toEqual([
        "#ff0000",
        "#ff0000",
        "#123456",
        "#123456",
      ]);
    },
  );

  test.each([Orientation.vertical, Orientation.horizontal])(
    "keeps hidden markers out of the result after reloading a %s diagram",
    (orientation) => {
      const matrix = new ChordMatrix(3, 4);
      matrix.toggleEmptyState(0).toggleEmptyState(0);
      matrix.toggleEmptyState(2).toggleEmptyState(2);
      matrix.emptyStringColor(1, "#0000ff");
      const settings = { strings: 4, frets: 3, orientation };
      const restored = ChordMatrix.fromChart({
        chord: JSON.parse(JSON.stringify(matrix.toVexchord())),
        settings,
      });
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "test-chord-diagram";
      document.body.appendChild(svg);

      new SVGuitarChord("#test-chord-diagram")
        .configure(settings)
        .chord(toSvguitarChord(restored.toVexchord()))
        .draw();

      expect(svg.querySelector(".open-string-0")).toBeNull();
      expect(svg.querySelector(".open-string-2")).toBeNull();
      expect(svg.querySelectorAll(".open-string")).toHaveLength(2);
      expect(svg.querySelector(".open-string-1")?.getAttribute("stroke")).toBe(
        "#0000ff",
      );
      expect(svg.querySelector(".open-string-3")?.getAttribute("stroke")).toBe(
        "#000000",
      );
    },
  );

  test.each([
    { style: ChordStyle.normal, orientation: Orientation.vertical },
    { style: ChordStyle.normal, orientation: Orientation.horizontal },
    { style: ChordStyle.handdrawn, orientation: Orientation.vertical },
    { style: ChordStyle.handdrawn, orientation: Orientation.horizontal },
  ])(
    "renders hidden labels without marker outlines in $style $orientation diagrams",
    ({ style, orientation }) => {
      const settings = { strings: 4, frets: 3, color: "#123456", orientation, style };
      const matrix = ChordMatrix.fromChart({
        chord: {
          fingers: [
            [4, OPEN, { text: "R", strokeColor: "#00ff00", textColor: "#ff0000" }],
            [2, OPEN, { strokeColor: "#0000ff" }],
            [1, SILENT, { strokeColor: "#ff00ff" }],
          ],
          barres: [],
        },
        settings,
      });
      matrix.toggleEmptyState(0).toggleEmptyState(0);
      matrix.toggleEmptyState(1).toggleEmptyState(1);
      const saved = JSON.stringify(matrix.toVexchord());
      const restored = ChordMatrix.fromChart({ chord: JSON.parse(saved), settings });
      const chordToDraw = toSvguitarChord(restored.toVexchord());

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "test-chord-diagram";
      document.body.appendChild(svg);
      const chart = new SVGuitarChord("#test-chord-diagram").configure(settings);
      // In Node, switching renderer removes the existing SVG root. Restore its host
      // before SVGuitar initializes the selected renderer on the next draw.
      if (!svg.isConnected) document.body.appendChild(svg);
      chart.chord(chordToDraw).draw();

      const label = svg.querySelector(".string-text-0");
      expect(label?.textContent).toBe("R");
      expect(label?.getAttribute("fill")).toBe("#ff0000");
      const marker = svg.querySelector(".open-string-0")!;
      expect(marker).not.toBeNull();
      const shapes = marker.matches("circle")
        ? [marker]
        : Array.from(marker.querySelectorAll("path"));
      expect(shapes.length).toBeGreaterThan(0);
      shapes.forEach((shape) => {
        expect(shape.getAttribute("stroke")).toBe("none");
        expect(shape.getAttribute("fill")).toBe("none");
      });

      expect(svg.querySelector(".open-string-1")).toBeNull();
      expect(svg.querySelector(".string-text-1")).toBeNull();
      expect(svg.querySelector(".open-string-2")).not.toBeNull();
      expect(chordToDraw.fingers).toContainEqual([2, OPEN, { strokeColor: "#0000ff" }]);
      expect(chordToDraw.fingers).toContainEqual([1, SILENT, { strokeColor: "#ff00ff" }]);
      expect(JSON.stringify(restored.toVexchord())).toBe(saved);
    },
  );

  test.each([OPEN, SILENT, 2])(
    "does not add a hidden label over an existing finger (%s)",
    (value) => {
      const chord: EditableChord = {
        fingers: [[3, value]],
        barres: [],
        hiddenStrings: [{ string: 3, text: "R" }],
      };

      expect(toSvguitarChord(chord).fingers).toEqual(chord.fingers);
    },
  );

  test.each([
    { fromString: 4, toString: 2 },
    { fromString: 2, toString: 4 },
  ])(
    "does not add hidden labels over a barre from $fromString to $toString",
    (barre) => {
      const chord: EditableChord = {
        fingers: [],
        barres: [{ ...barre, fret: 1 }],
        hiddenStrings: [
          { string: 4, text: "R" },
          { string: 3, text: "3" },
          { string: 2, text: "5" },
        ],
      };

      expect(toSvguitarChord(chord).fingers).toEqual([]);
      expect(toSvguitarChord(chord).barres).toEqual(chord.barres);
    },
  );
});
