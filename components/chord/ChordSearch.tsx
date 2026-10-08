import * as React from "react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { T, useT } from "@magic-translate/react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Chart, ChartSettings } from "@/domain/chart";
import { useEscHandler } from "@/hooks/use-esc-handler";
import { useOutsideHandler } from "@/hooks/use-outside-click";
import { ChordThumbnail } from "./ChordThumbnail";

type ChordSearchModule = typeof import("@/services/chord-search");
type Instrument = import("@/services/chord-search").Instrument;

const numStrings: Record<Instrument, number> = { guitar: 6, ukulele: 4 };

export const ChordSearch: React.FunctionComponent<{
  settings: ChartSettings;
  onChart(chart: Chart, name: string): void;
}> = ({ settings, onChart }) => {
  const t = useT();
  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("guitar");
  const [open, setOpen] = useState(false);
  // The chord database is loaded on first use, it isn't needed to draw a chord
  const [search, setSearch] = useState<ChordSearchModule>();
  const ref = useRef<HTMLDivElement>(null);

  const instruments: { value: Instrument; label: string }[] = [
    { value: "guitar", label: t("Guitar") },
    { value: "ukulele", label: t("Ukulele") },
  ];

  useOutsideHandler(ref, () => setOpen(false));
  useEscHandler(() => setOpen(false));

  useEffect(() => {
    if (open && !search) {
      import("@/services/chord-search").then(setSearch);
    }
  }, [open, search]);

  const deferredQuery = useDeferredValue(query);
  const results = React.useMemo(
    () => search?.findChords(deferredQuery, instrument) ?? [],
    [search, deferredQuery, instrument],
  );

  const onSelect = (result: (typeof results)[number]) => {
    if (search) {
      onChart(search.chartFromSearchResult(result, settings), result.name);
    }
    setQuery("");
    setOpen(false);
  };

  const showResults = open && query.trim() !== "" && search !== undefined;

  return (
    <div ref={ref} className="relative mt-10 space-y-2">
      <Label htmlFor="chord-search" className="block">
        <T>Find a chord</T>
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="chord-search"
            type="search"
            autoComplete="off"
            className="ps-9"
            placeholder={t("Search a chord, e.g. Am7 or D/F#")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </div>
        <div
          role="group"
          aria-label={t("Instrument")}
          className="flex rounded-md border border-input p-0.5"
        >
          {instruments.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={instrument === value ? "default" : "ghost"}
              aria-pressed={instrument === value}
              onClick={() => setInstrument(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {showResults && (
        <div className="absolute z-20 max-h-[28rem] w-full overflow-y-auto rounded-md border bg-popover p-3 text-popover-foreground shadow-md">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <T>No chords found</T>
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {results.map((result) => (
                <li key={`${result.name}-${result.voicing}`}>
                  <button
                    type="button"
                    className="flex h-full w-full flex-col items-center justify-end gap-1 rounded-md border bg-white p-1 text-black hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${result.name} (${result.voicing + 1}/${
                      result.voicings
                    })`}
                    onClick={() => onSelect(result)}
                  >
                    <ChordThumbnail
                      chord={result.chord}
                      strings={numStrings[result.instrument]}
                    />
                    <span className="text-sm font-medium">{result.name}</span>
                    {result.voicings > 1 && (
                      <span className="text-xs text-neutral-500">
                        {result.voicing + 1}/{result.voicings}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
