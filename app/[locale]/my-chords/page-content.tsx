"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { T, useT } from "@magic-translate/react";
import NextLink from "@/components/LocalizedLink";
import { ChordNameDialog } from "@/components/saved-chords/ChordNameDialog";
import { SavedChordItem } from "@/components/saved-chords/SavedChordItem";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  countSavedChords,
  deleteSavedChord,
  fetchSavedChords,
  FREE_SAVED_CHORDS_LIMIT,
  renameSavedChord,
  SAVED_CHORDS_PAGE_SIZE,
  type SavedChord,
  type SavedChordsSort,
  type SortDirection,
} from "@/services/saved-chords";
import { SubscriptionType } from "@/types";
import { useSubscription } from "@/utils/useSubscription";
import { useUser } from "@/utils/useUser";

const sortOptions = [
  { value: "created_at:desc", label: "Sorted by date, newest first" },
  { value: "created_at:asc", label: "Sorted by date, oldest first" },
  { value: "name:asc", label: "Sorted by name, A to Z" },
  { value: "name:desc", label: "Sorted by name, Z to A" },
];

function useDebounced<V>(value: V, delay: number): V {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

const DeleteDialog = ({
  savedChord,
  onClose,
  onDeleted,
}: {
  savedChord: SavedChord | null;
  onClose(): void;
  onDeleted(): void;
}) => {
  const t = useT();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const remove = async () => {
    if (!savedChord) return;
    setDeleting(true);
    setError(false);
    try {
      await deleteSavedChord(savedChord.id);
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!savedChord} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Delete this chord?")}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">
              {savedChord?.name}
            </span>{" "}
            <T>will be removed from My chords. This can&apos;t be undone.</T>
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive">
            <T>Something went wrong. Please try again.</T>
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <T>Cancel</T>
          </Button>
          <Button variant="destructive" onClick={remove} disabled={deleting}>
            {deleting && <Loader2 className="animate-spin" />}
            <T>Delete</T>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MyChords = () => {
  const t = useT();
  const queryClient = useQueryClient();
  const subscription = useSubscription();
  // Queries wait for the session; before it is restored they would run anonymously.
  const { user } = useUser();
  const userId = user?.id;
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState(sortOptions[0].value);
  const [renaming, setRenaming] = useState<SavedChord | null>(null);
  const [deleting, setDeleting] = useState<SavedChord | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounced(search.trim(), 300);
  const [sort, direction] = sortValue.split(":") as [
    SavedChordsSort,
    SortDirection,
  ];

  const {
    data,
    error,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ["saved-chords", userId, "list", debouncedSearch, sort, direction],
    ({ pageParam = 0 }) =>
      fetchSavedChords({ search: debouncedSearch, sort, direction }, pageParam),
    {
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === SAVED_CHORDS_PAGE_SIZE ? pages.length : undefined,
      keepPreviousData: true,
      enabled: !!userId,
    },
  );

  const { data: count } = useQuery(
    ["saved-chords", userId, "count"],
    countSavedChords,
    { enabled: !!userId },
  );

  // Load the next 50 once the end of the list scrolls into view.
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = () => queryClient.invalidateQueries(["saved-chords"]);
  const chords = data?.pages.flat() ?? [];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          <T>My chords</T>
        </h1>
        {subscription === SubscriptionType.FREE && count !== undefined && (
          <p className="text-sm text-muted-foreground">
            {count} / {FREE_SAVED_CHORDS_LIMIT} <T>free chord slots used.</T>{" "}
            <NextLink
              href="/pricing"
              className="font-medium text-foreground underline underline-offset-4"
            >
              <T>Go Pro for unlimited chords</T>
            </NextLink>
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            className="ps-9"
            placeholder={t("Search by name")}
            aria-label={t("Search by name")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="sm:w-64" aria-label={t("Sort")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {t(label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-destructive">
          <T>Your chords could not be loaded. Please reload the page.</T>
        </p>
      ) : chords.length === 0 ? (
        <div className="py-16 text-center">
          {debouncedSearch ? (
            <p className="text-muted-foreground">
              <T>No chords match your search.</T>
            </p>
          ) : (
            <>
              <p className="mb-4 text-muted-foreground">
                <T>
                  You haven&apos;t saved any chords yet. Create one in the
                  editor and click &quot;Save to my chords&quot;.
                </T>
              </p>
              <NextLink href="/" className={buttonVariants()}>
                <T>Create chord diagram</T>
              </NextLink>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {chords.map((savedChord) => (
            <SavedChordItem
              key={savedChord.id}
              savedChord={savedChord}
              onRename={setRenaming}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <div ref={sentinel} />
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      <ChordNameDialog
        open={!!renaming}
        onOpenChange={(open) => !open && setRenaming(null)}
        title={t("Rename chord")}
        initialName={renaming?.name ?? ""}
        submitLabel={t("Rename")}
        onSubmit={async (name) => {
          if (!renaming) return;
          await renameSavedChord(renaming.id, name);
          setRenaming(null);
          refresh();
        }}
      />
      <DeleteDialog
        savedChord={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={refresh}
      />
    </section>
  );
};

export default MyChords;
