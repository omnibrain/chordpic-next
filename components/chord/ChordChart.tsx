import { Box } from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useRef } from "react";
import { ChordSettings, SVGuitarChord } from "svguitar";
import { SubscriptionType } from "../../types";
import { useSubscription } from "../../utils/useSubscription";
import { useChart } from "./useChart";
import * as Sentry from "@sentry/react";

const defaultSVGuitarSettings: Partial<ChordSettings> = {
  fretSize: 1.75,
  barreChordRadius: 0.5,
};

export const ChordChart: React.FunctionComponent = () => {
  const { chart, ref, setSize } = useChart();
  const svguitarRef = useRef<SVGuitarChord>();
  const subscription = useSubscription();

  const watermark = React.useMemo(
    () =>
      subscription === SubscriptionType.PRO ? "" : "created with chordpic.com",
    [subscription]
  );

  useEffect(() => {
    if (ref.current && !svguitarRef.current) {
      svguitarRef.current = new SVGuitarChord(ref.current);
    }

    if (svguitarRef.current) {
      try {
        const size = svguitarRef.current
          .configure({
            ...defaultSVGuitarSettings,
            ...chart.settings,
            svgTitle: "Chord diagram created with chordpic.com",
            watermark,
            watermarkFontSize: 16,
            watermarkColor: "rgba(0, 0, 0, 0.5)",
          })
          .chord(chart.chord)
          .draw();

        setSize(size);
      } catch (err) {
        Sentry.captureException(err, { extra: { chart } });

        throw err;
      }
    }
  }, [chart, ref, setSize, watermark]);

  return (
    <Box
      height="100%"
      display="flex"
      flexDir="column"
      alignItems="stretch"
      justifyContent="flex-start"
    >
      <Box
        id="chord-result"
        flex="1"
        maxHeight="40rem"
        ref={ref}
        sx={{
          svg: {
            height: "100%",
            width: "100%",
          },
        }}
      ></Box>
    </Box>
  );
};
