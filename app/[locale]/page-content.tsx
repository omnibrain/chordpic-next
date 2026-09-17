"use client";

import { T, useT } from "@magic-translate/react";
import React, { useCallback } from "react";
import { RotateCw } from "lucide-react";
import { Orientation } from "svguitar";
import { ChordEditor } from "@/components/chord/ChordEditor";
import { ChordResult } from "@/components/chord/ChordResult";
import { useChart } from "@/components/chord/useChart";
import { AdjustableChordSettings, ChordForm } from "@/components/ChordForm";
import { DownloadButtons } from "@/components/DownloadButtons";
import { ShareButtons } from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResizeHandler } from "@/hooks/use-resize-handler";
import { GA } from "@/services/google-analytics";

const panelHeading =
  "inline-block font-heading text-lg font-semibold tracking-tight";

const Home = () => {
  const t = useT();
  const { width, height } = useResizeHandler();
  const { setChart, chart, hydrated } = useChart();

  const onSettings = useCallback(
    (newSettings: AdjustableChordSettings) =>
      setChart({
        chord: chart.chord,
        settings: {
          ...chart.settings,
          ...newSettings,
        },
      }),
    [chart.chord, chart.settings, setChart],
  );

  return (
    <>
      {/*
        Keyed so the editor is rebuilt once the stored chart arrives: ChordForm
        and ChordEditor both copy it into their own state on mount.
      */}
      <React.Fragment key={hydrated ? "stored" : "default"}>
        <ChordForm settings={chart.settings} onSettings={onSettings} />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="p-4">
            <div id="editor" className="relative">
              <h2 className={panelHeading}>
                <T>Editor</T>
              </h2>
              <div className="flex justify-center">
                <ChordEditor
                  numFrets={chart.settings.frets ?? 5}
                  numStrings={chart.settings.strings ?? 6}
                  chord={chart.chord}
                  settings={chart.settings}
                  onChart={setChart}
                  width={width * 0.9}
                  height={height * 0.6}
                />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div id="result" className="relative h-full">
              <h2 className={panelHeading}>
                <T>Result</T>
              </h2>
              <div className="absolute right-0 top-0 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={t("Rotate chord diagram")}
                      onClick={() => {
                        GA()?.("event", "rotate_chord_diagram");
                        setChart({
                          ...chart,
                          settings: {
                            ...chart.settings,
                            orientation:
                              chart.settings.orientation ===
                              Orientation.horizontal
                                ? Orientation.vertical
                                : Orientation.horizontal,
                          },
                        });
                      }}
                    >
                      <RotateCw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("Rotate chord diagram")}</TooltipContent>
                </Tooltip>
              </div>
              <ChordResult />
            </div>
          </Card>
        </div>
      </React.Fragment>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DownloadButtons title={chart.settings.title} />
        <ShareButtons chart={chart} />
      </div>
    </>
  );
};

export default Home;
