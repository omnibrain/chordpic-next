"use client";

import { useEffect } from "react";
import Link from "@/components/LocalizedLink";
import { ChordResult } from "@/components/chord/ChordResult";
import { useChart } from "@/components/chord/useChart";
import { DownloadButtons } from "@/components/DownloadButtons";
import { ShareButtons } from "@/components/ShareButtons";
import { buttonVariants } from "@/components/ui/button";
import { Chart } from "@/domain/chart";
import type { ChordDiagram } from "@/services/chord-ssr";
import { SubscriptionType } from "@/types";
import { useSubscription } from "@/utils/useSubscription";

export interface ChordViewProps {
  chart: Chart;
  /** Null when the server could not draw this chart; the browser then does. */
  diagram: ChordDiagram | null;
  editHeading: string;
  editLabel: string;
}

const ChordView = ({
  chart,
  diagram,
  editHeading,
  editLabel,
}: ChordViewProps) => {
  const { ref, setChart, setSize } = useChart();
  const subscription = useSubscription();

  // Adopting the shared chord is what makes "Edit this chord diagram" open it
  // in the editor, and it gives the download buttons their pixel dimensions.
  useEffect(() => {
    setChart(chart);
    if (diagram) setSize({ width: diagram.width, height: diagram.height });
  }, [chart, diagram, setChart, setSize]);

  // The server has no session, so it always draws the watermark. Pro visitors
  // are the only ones who need the diagram drawn a second time.
  const redraw = !diagram || subscription === SubscriptionType.PRO;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        {redraw ? (
          <ChordResult />
        ) : (
          <div className="flex h-full flex-col items-stretch justify-start">
            <div
              id="chord-result"
              className="max-h-[40rem] flex-1"
              ref={ref}
              dangerouslySetInnerHTML={{ __html: diagram.svg }}
            />
          </div>
        )}
      </div>
      <div>
        <DownloadButtons title={chart.settings.title} />
        <ShareButtons chart={chart} />
        <h2 className="mb-3 mt-8 font-heading text-2xl font-semibold tracking-tight">
          {editHeading}
        </h2>
        <Link href="/" className={buttonVariants()}>
          {editLabel}
        </Link>
      </div>
    </div>
  );
};

export default ChordView;
