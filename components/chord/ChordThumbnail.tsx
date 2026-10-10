import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { SVGuitarChord } from "@svguitar/core";
import type { Chart } from "@/domain/chart";
import {
  toSvguitarChord,
  toSvguitarSettings,
} from "@/services/chord-rendering";

/** A chart drawn in its own style, without the title (the tile shows the name). */
export const ChordThumbnail: React.FunctionComponent<{ chart: Chart }> = ({
  chart,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Drawn before paint so a tile never shows up empty
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.replaceChildren();
    new SVGuitarChord(ref.current)
      .configure({
        ...toSvguitarSettings(chart.settings, ""),
        title: undefined,
      })
      .chord(toSvguitarChord(chart.chord))
      .draw();
  }, [chart]);

  return <div ref={ref} className="w-full" aria-hidden />;
};
