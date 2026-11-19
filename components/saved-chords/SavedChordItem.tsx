"use client";

import { useEffect, useRef, useState } from "react";
import { SVGuitarChord } from "@svguitar/core";
import * as Sentry from "@sentry/nextjs";
import {
  Download,
  MoreHorizontal,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { T, useT } from "@magic-translate/react";
import { useChart } from "@/components/chord/useChart";
import { cn } from "@/lib/utils";
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
import type { SavedChord, SavedChordsView } from "@/services/saved-chords";
import { WithTooltip } from "@/components/ui/with-tooltip";
import { SubscriptionType } from "@/types";
import { useLocalizedRouter } from "@/utils/use-localized-router";
import { useSubscription } from "@/utils/useSubscription";

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
  view: SavedChordsView;
}

export const SavedChordItem = ({
  savedChord,
  onRename,
  onDelete,
  view,
}: Props) => {
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

  const actions = (
    <div className="flex shrink-0 items-center gap-0.5">
      <WithTooltip label={t("Open in editor")}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          aria-label={t("Open in editor")}
          onClick={openInEditor}
        >
          <SquarePen />
        </Button>
      </WithTooltip>
      <DropdownMenu>
        <WithTooltip label={t("Download")}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={t("Download")}
              disabled={!size}
            >
              <Download />
            </Button>
          </DropdownMenuTrigger>
        </WithTooltip>
        <DropdownMenuContent align="end">
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
      <DropdownMenu>
        <WithTooltip label={t("More actions")}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={t("More actions")}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
        </WithTooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onRename(savedChord)}>
            <Pencil />
            <T>Rename</T>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDelete(savedChord)}>
            <Trash2 />
            <T>Delete</T>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const preview = (className: string) => (
    <div
      ref={ref}
      className={cn("shrink-0 [&>svg]:h-auto [&>svg]:w-full", className)}
      role="img"
      aria-label={name}
    />
  );

  if (view === "grid") {
    return (
      <Card className="flex flex-col items-center px-1 pb-1 pt-3">
        <WithTooltip label={name}>
          {preview("w-full max-w-28 px-1")}
        </WithTooltip>
        <div className="mt-auto pt-1">{actions}</div>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {preview("w-16")}
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-heading font-semibold" title={name}>
          {name}
        </h2>
        <p className="text-xs text-muted-foreground">
          {new Date(savedChord.created_at).toLocaleDateString()}
        </p>
      </div>
      {actions}
    </div>
  );
};
