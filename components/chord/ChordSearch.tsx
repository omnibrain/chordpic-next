import * as React from "react";
import { useDeferredValue, useRef, useState } from "react";
import { T, useT } from "@magic-translate/react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Chart, ChartSettings } from "@/domain/chart";
import { useEscHandler } from "@/hooks/use-esc-handler";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { cn } from "@/lib/utils";
import { ChordThumbnail } from "./ChordThumbnail";

type ChordSearchModule = typeof import("@/services/chord-search");
type Instrument = import("@/services/chord-search").Instrument;
type Result = import("@/services/chord-search").ChordSearchResult;

const numStrings: Record<Instrument, number> = { guitar: 6, ukulele: 4 };

const pageSize = 12;

const spring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
} as const;

const inputClassName =
  "bg-background ps-9 [&::-webkit-search-cancel-button]:appearance-none";

/**
 * Finds chords by name. Phones get a plain field in the page with the results
 * below it, since iOS handles inputs in fixed overlays badly once the keyboard
 * is open. Larger screens get a bar floating at the bottom that springs open.
 */
export const ChordSearch: React.FunctionComponent<{
  settings: ChartSettings;
  onChart(chart: Chart, name: string): void;
}> = ({ settings, onChart }) => {
  const t = useT();
  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("guitar");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  // The chord database is loaded on first use, it isn't needed to draw a chord
  const [search, setSearch] = useState<ChordSearchModule>();
  const floatingInputRef = useRef<HTMLInputElement>(null);

  const loadSearch = () => {
    if (!search) {
      import("@/services/chord-search").then(setSearch);
    }
  };

  const close = () => {
    setOpen(false);
    floatingInputRef.current?.blur();
  };

  useEscHandler(close);
  useScrollLock(open);
  const viewport = useVisualViewport();
  // Only decides where results go, which only exist after typing
  const tabletUp = useMediaQuery("(min-width: 768px)");

  const deferredQuery = useDeferredValue(query);
  const results = React.useMemo(
    () => search?.findChords(deferredQuery, instrument) ?? [],
    [search, deferredQuery, instrument],
  );
  const showResults = query.trim() !== "" && search !== undefined;

  const onQuery = (value: string) => {
    loadSearch();
    setQuery(value);
    setPage(0);
  };

  const onInstrument = (value: Instrument) => {
    setInstrument(value);
    setPage(0);
  };

  const onSelect = (result: Result) => {
    if (search) {
      onChart(search.chartFromSearchResult(result, settings), result.name);
    }
    setQuery("");
    close();
  };

  const resultsView = showResults && (
    <SearchResults
      results={results}
      page={page}
      onPage={setPage}
      onSelect={onSelect}
    />
  );

  return (
    <>
      <div className="mt-10 space-y-2 md:hidden">
        <label htmlFor="chord-search" className="block text-sm font-medium">
          <T>Find a chord</T>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="chord-search"
              type="search"
              autoComplete="off"
              className={inputClassName}
              placeholder={t("e.g. Am7 or D/F#")}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onFocus={loadSearch}
            />
          </div>
          <InstrumentToggle value={instrument} onChange={onInstrument} />
        </div>
        {!tabletUp && resultsView && <div className="pt-2">{resultsView}</div>}
      </div>

      <MotionConfig transition={spring} reducedMotion="user">
        <AnimatePresence>
          {open && (
            <motion.div
              key="backdrop"
              aria-hidden
              className="fixed inset-0 z-40 hidden bg-black/30 backdrop-blur-[2px] md:block"
              style={
                viewport
                  ? {
                      top: viewport.top,
                      bottom: "auto",
                      height: viewport.height,
                    }
                  : undefined
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
            />
          )}
        </AnimatePresence>
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-0 z-50 hidden flex-col items-center justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:flex",
            open && "top-0 pt-4",
          )}
          style={
            open && viewport
              ? { top: viewport.top, bottom: "auto", height: viewport.height }
              : undefined
          }
        >
          <motion.div
            layout
            layoutDependency={open}
            role="search"
            className={cn(
              "pointer-events-auto flex flex-col overflow-hidden text-popover-foreground",
              open
                ? "max-h-full w-full max-w-3xl border bg-popover shadow-lg"
                : "w-72 max-w-full shadow-[0_6px_20px_-4px_rgb(0_0_0/0.12),0_2px_6px_-2px_rgb(0_0_0/0.06)]",
            )}
            style={{ borderRadius: open ? 12 : 6 }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {open && (
                <motion.div
                  key="header"
                  layout="position"
                  layoutDependency={open}
                  className="flex shrink-0 items-center justify-between gap-2 p-3 pb-0"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.1 } }}
                >
                  <InstrumentToggle
                    value={instrument}
                    onChange={(value) => {
                      onInstrument(value);
                      floatingInputRef.current?.focus();
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("Close")}
                    onClick={close}
                  >
                    <X />
                  </Button>
                </motion.div>
              )}
              {open && (
                <motion.div
                  key="results"
                  layout="position"
                  layoutDependency={open}
                  className="min-h-0 overflow-y-auto overscroll-contain px-3 pt-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.1 } }}
                >
                  {resultsView}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              layout="position"
              layoutDependency={open}
              className={cn("relative shrink-0", open && "p-3")}
            >
              <Search
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  open ? "start-6" : "start-3",
                )}
              />
              <Input
                ref={floatingInputRef}
                type="search"
                autoComplete="off"
                aria-label={t("Find a chord")}
                className={inputClassName}
                placeholder={
                  open
                    ? t("Search a chord, e.g. Am7 or D/F#")
                    : t("Find a chord")
                }
                value={query}
                onChange={(e) => {
                  onQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  loadSearch();
                  setOpen(true);
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </MotionConfig>
    </>
  );
};

const InstrumentToggle: React.FunctionComponent<{
  value: Instrument;
  onChange(value: Instrument): void;
}> = ({ value, onChange }) => {
  const t = useT();
  const instruments: { value: Instrument; label: string }[] = [
    { value: "guitar", label: t("Guitar") },
    { value: "ukulele", label: t("Ukulele") },
  ];

  return (
    <div
      role="group"
      aria-label={t("Instrument")}
      className="flex rounded-md border border-input p-0.5"
    >
      {instruments.map((instrument) => (
        <Button
          key={instrument.value}
          type="button"
          size="sm"
          variant={value === instrument.value ? "default" : "ghost"}
          aria-pressed={value === instrument.value}
          onClick={() => onChange(instrument.value)}
        >
          {instrument.label}
        </Button>
      ))}
    </div>
  );
};

const SearchResults: React.FunctionComponent<{
  results: Result[];
  page: number;
  onPage(page: number): void;
  onSelect(result: Result): void;
}> = ({ results, page, onPage, onSelect }) => {
  const t = useT();
  const pages = Math.ceil(results.length / pageSize);
  const pageResults = results.slice(page * pageSize, (page + 1) * pageSize);

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        <T>No chords found</T>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {pageResults.map((result, i) => (
          <motion.li
            // Kept by position, so typing redraws the tiles instead of replacing them
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: i * 0.015 }}
          >
            <button
              type="button"
              className="flex h-full w-full flex-col items-center justify-end gap-1 rounded-md border bg-white p-1 text-black transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${result.name} (${result.voicing + 1}/${
                results.length
              })`}
              onClick={() => onSelect(result)}
            >
              <ChordThumbnail
                chord={result.chord}
                strings={numStrings[result.instrument]}
              />
              <span className="text-sm font-medium">{result.name}</span>
            </button>
          </motion.li>
        ))}
      </ul>
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("Previous page")}
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("Next page")}
            disabled={page === pages - 1}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
};
