"use client";

import { useEffect, useRef, useState } from "react";
import { SVGuitarChord } from "@svguitar/core";
import * as Sentry from "@sentry/nextjs";
import { ChevronDown, Download, Pencil, SquarePen, Trash2 } from "lucide-react";
import { T, useT } from "@magic-translate/react";
import { useChart } from "@/components/chord/useChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  toSvguitarChord,
  toSvguitarSettings,
} from "@/services/chord-rendering";
import { GA } from "@/services/google-analytics";
import { ImageService } from "@/services/image-service";
import type { SavedChord } from "@/services/saved-chords";
import { WithTooltip } from "@/components/ui/with-tooltip";
import { SubscriptionType } from "@/types";
import { useLocalizedRouter } from "@/utils/use-localized-router";
import { useSubscription } from "@/utils/useSubscription";

const actionButton = "h-6 gap-1 px-2 text-[11px] [&_svg]:size-3";

// Same sizes as the editor's download buttons
const pngSizes = [
  { multiplier: 0.5, name: "Small" },
  { multiplier: 1, name: "Medium" },
  { multiplier: 2, name: "Large" },
  { multiplier: 4, name: "Huge" },
];

interface Props {
  savedChord: SavedChord;
  onRename(savedChord: SavedChord): void;
  onDelete(savedChord: SavedChord): void;
}

export const SavedChordItem = ({ savedChord, onRename, onDelete }: Props) => {
  const t = useT();
  const { chart, name } = savedChord;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();
  const subscription = useSubscription();
  const { setChart } = useChart();
  const router = useLocalizedRouter();
  const watermark =
    subscription === SubscriptionType.PRO ? "" : "created with chordpic.com";

  useEffect(() => {
    if (!ref.current || !subscription) return;
    ref.current.replaceChildren();
    try {
      setSize(
        new SVGuitarChord(ref.current)
          .configure(toSvguitarSettings(chart.settings, watermark))
          .chord(toSvguitarChord(chart.chord))
          .draw(),
      );
    } catch (err) {
      Sentry.captureException(err, { extra: { chart } });
    }
  }, [chart, watermark, subscription]);

  const svg = () => ref.current?.querySelector<SVGSVGElement>("svg[viewBox]");

  const downloadSvg = () => {
    if (!ref.current) return;
    GA()?.("event", "image_download", { format: "svg", source: "my_chords" });
    ImageService.downloadSvg(ref.current.innerHTML, name);
  };

  const downloadPng = (width: number) => {
    const element = svg();
    if (!element) return;
    GA()?.("event", "image_download", { value: width, source: "my_chords" });
    ImageService.downloadPng(element, width, name);
  };

  const openInEditor = () => {
    GA()?.("event", "open_saved_chord");
    setChart(chart);
    router.push("/");
  };

  return (
    <Card className="flex flex-col p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2
            className="truncate font-heading text-base font-semibold"
            title={name}
          >
            {name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {new Date(savedChord.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="-me-1.5 -mt-1 flex shrink-0">
          <WithTooltip label={t("Rename chord")}>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label={t("Rename chord")}
              onClick={() => onRename(savedChord)}
            >
              <Pencil />
            </Button>
          </WithTooltip>
          <WithTooltip label={t("Delete chord")}>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label={t("Delete chord")}
              onClick={() => onDelete(savedChord)}
            >
              <Trash2 />
            </Button>
          </WithTooltip>
        </div>
      </div>
      <div
        ref={ref}
        className="mx-auto my-2 aspect-square w-full max-w-40 [&>svg]:h-full [&>svg]:w-full"
        role="img"
        aria-label={name}
      />
      <div className="mt-auto flex flex-wrap justify-center gap-1.5">
        <Button size="sm" className={actionButton} onClick={openInEditor}>
          <SquarePen />
          <T>Open in editor</T>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className={actionButton}
              disabled={!size}
            >
              <Download />
              <T>Download</T>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={downloadSvg}>SVG</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>PNG</DropdownMenuLabel>
            {size &&
              pngSizes.map(({ multiplier, name: sizeName }) => {
                const width = Math.round(size.width * multiplier);
                const height = Math.round(size.height * multiplier);
                return (
                  <DropdownMenuItem
                    key={multiplier}
                    onSelect={() => downloadPng(width)}
                  >
                    <T>{sizeName} PNG</T>
                    <span className="ms-auto ps-4 text-xs text-muted-foreground">
                      {width} x {height}
                    </span>
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
