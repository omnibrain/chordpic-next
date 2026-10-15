"use client";

import { useT } from "@magic-translate/react";
import React, { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import {
  isPlayable,
  playChord,
  stringTuning,
  type Playback,
} from "@svguitar/play-plugin";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Chart } from "@/domain/chart";
import { GA } from "@/services/google-analytics";

export const PlayButton = ({ chart }: { chart: Chart }) => {
  const t = useT();
  const playback = useRef<Playback>(undefined);

  useEffect(() => () => playback.current?.stop(), []);

  const playable = isPlayable(chart.chord, chart.settings);
  const tooltip = playable
    ? t("Play chord")
    : stringTuning(chart.settings)
      ? t("No strings to play")
      : t("Name all strings to play");

  const button = (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("Play chord")}
      disabled={!playable}
      onClick={() => {
        GA()?.("event", "play_chord");
        playback.current?.stop();
        playback.current = playChord(chart.chord, chart.settings);
      }}
    >
      <Play />
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* A disabled button gets no pointer events, so the tooltip needs a wrapper */}
        {playable ? button : <span tabIndex={0}>{button}</span>}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};
