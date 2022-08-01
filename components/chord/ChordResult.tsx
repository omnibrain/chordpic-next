import { Box } from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useRef } from "react";
import { ChordSettings, SVGuitarChord } from "svguitar";
import { useChart } from "./useChart";

const defaultSVGuitarSettings: Partial<ChordSettings> = {
  fretSize: 1.75,
  barreChordRadius: 0.5,
};

export const ChordResult: React.FunctionComponent = () => {
  const { chart, ref, setSize } = useChart();
  const svguitarRef = useRef<SVGuitarChord>();

  useEffect(() => {
    if (ref.current && !svguitarRef.current) {
      svguitarRef.current = new SVGuitarChord(ref.current);
    }

    if (svguitarRef.current) {
      const size = svguitarRef.current
        .configure({
          ...defaultSVGuitarSettings,
          ...chart.settings,
        })
        .chord(chart.chord)
        .draw();

      setSize(size);
    }
  }, [chart, ref, setSize]);

  return (
    <Box
      id="chord-result"
      ref={ref}
      display="flex"
      justifyContent="center"
      maxHeight="40rem"
      sx={{
        svg: {
          height: "100%",
          width: "100%",
        },
      }}
    />
  );
};
