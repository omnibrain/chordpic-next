import { Orientation, SVGuitarChord } from "svguitar";
import { ChordMatrix } from "./chord-matrix";

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
        .chord(matrix.toVexchord());

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
        .chord(restored.toVexchord())
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
});
