import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { SVGuitarChord, type Chord } from "@svguitar/core";

export const ChordThumbnail: React.FunctionComponent<{
  chord: Chord;
  strings: number;
}> = ({ chord, strings }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Drawn before paint so a tile never shows up empty
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.replaceChildren();
    new SVGuitarChord(ref.current)
      .configure({ strings, frets: 4, fretSize: 1.75, barreChordRadius: 0.5 })
      .chord({ ...chord, title: undefined })
      .draw();
  }, [chord, strings]);

  return <div ref={ref} className="w-full" aria-hidden />;
};
