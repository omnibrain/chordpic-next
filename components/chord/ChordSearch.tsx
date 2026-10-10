import * as React from "react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { T, useT } from "@magic-translate/react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Chart, ChartSettings } from "@/domain/chart";
import { useEscHandler } from "@/hooks/use-esc-handler";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/utils";
import { ChordThumbnail } from "./ChordThumbnail";

type ChordSearchModule = typeof import("@/services/chord-search");
type Instrument = import("@/services/chord-search").Instrument;

const numStrings: Record<Instrument, number> = { guitar: 6, ukulele: 4 };

const pageSize = 12;

const spring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
} as const;

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
  const inputRef = useRef<HTMLInputElement>(null);

  const instruments: { value: Instrument; label: string }[] = [
    { value: "guitar", label: t("Guitar") },
    { value: "ukulele", label: t("Ukulele") },
  ];

  const close = () => {
    setOpen(false);
    inputRef.current?.blur();
  };

  useEscHandler(close);
  useScrollLock(open);

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

  const pages = Math.ceil(results.length / pageSize);
  const pageResults = results.slice(page * pageSize, (page + 1) * pageSize);

  const onSelect = (result: (typeof results)[number]) => {
    if (search) {
      onChart(search.chartFromSearchResult(result, settings), result.name);
    }
    setQuery("");
    close();
  };

  const showResults = query.trim() !== "" && search !== undefined;

  return (
    <MotionConfig transition={spring} reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />
        )}
      </AnimatePresence>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <motion.div
          layout
          layoutDependency={open}
          role="search"
          className={cn(
            "pointer-events-auto overflow-hidden text-popover-foreground",
            open
              ? "w-full max-w-3xl border bg-popover shadow-lg"
              : "w-72 max-w-full shadow-[0_6px_20px_-4px_rgb(0_0_0/0.12),0_2px_6px_-2px_rgb(0_0_0/0.06)]",
          )}
          style={{ borderRadius: open ? 12 : 6 }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {open && (
              <motion.div
                key="panel"
                layout="position"
                layoutDependency={open}
                className="max-h-[calc(100dvh-7rem)] space-y-3 overflow-y-auto overscroll-contain p-3 pb-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12, transition: { duration: 0.1 } }}
              >
                <div className="flex items-center justify-between gap-2">
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
                        onClick={() => {
                          setInstrument(value);
                          setPage(0);
                          inputRef.current?.focus();
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("Close")}
                    onClick={close}
                  >
                    <X />
                  </Button>
                </div>
                {showResults &&
                  (results.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      <T>No chords found</T>
                    </p>
                  ) : (
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
                            aria-label={`${result.name} (${
                              result.voicing + 1
                            }/${results.length})`}
                            onClick={() => onSelect(result)}
                          >
                            <ChordThumbnail
                              chord={result.chord}
                              strings={numStrings[result.instrument]}
                            />
                            <span className="text-sm font-medium">
                              {result.name}
                            </span>
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  ))}
                {showResults && pages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t("Previous page")}
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
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
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            layout="position"
            layoutDependency={open}
            className={cn("relative", open && "p-3")}
          >
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                open ? "start-6" : "start-3",
              )}
            />
            <Input
              ref={inputRef}
              type="search"
              autoComplete="off"
              aria-label={t("Find a chord")}
              className={cn(
                "bg-background ps-9 [&::-webkit-search-cancel-button]:appearance-none",
              )}
              placeholder={
                open ? t("Search a chord, e.g. Am7 or D/F#") : t("Find a chord")
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
          </motion.div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};
