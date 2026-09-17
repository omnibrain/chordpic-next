import * as React from "react";
import { useEffect, useRef } from "react";
import { SVGuitarChord } from "svguitar";
import { SubscriptionType } from "../../types";
import { useSubscription } from "../../utils/useSubscription";
import { useChart } from "./useChart";
import {
  toSvguitarChord,
  toSvguitarSettings,
} from "../../services/chord-rendering";
import * as Sentry from "@sentry/nextjs";

export const ChordChart: React.FunctionComponent = () => {
  const { chart, ref, setSize } = useChart();
  const svguitarRef = useRef<SVGuitarChord>();
  const subscription = useSubscription();

  const watermark = React.useMemo(
    () =>
      subscription === SubscriptionType.PRO ? "" : "created with chordpic.com",
    [subscription],
  );

  useEffect(() => {
    if (ref.current && !svguitarRef.current) {
      svguitarRef.current = new SVGuitarChord(ref.current);
    }

    if (svguitarRef.current) {
      try {
        const size = svguitarRef.current
          .configure(toSvguitarSettings(chart.settings, watermark))
          .chord(toSvguitarChord(chart.chord))
          .draw();

        setSize(size);
      } catch (err) {
        Sentry.captureException(err, { extra: { chart } });

        throw err;
      }
    }
  }, [chart, ref, setSize, watermark]);

  return (
    <div className="flex h-full flex-col items-stretch justify-start">
      <div id="chord-result" className="max-h-[40rem] flex-1" ref={ref}></div>
    </div>
  );
};
