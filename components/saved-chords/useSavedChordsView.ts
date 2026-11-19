import { useCallback, useSyncExternalStore } from "react";
import type { SavedChordsView } from "@/services/saved-chords";

const KEY = "my_chords_view";
const listeners = new Set<() => void>();

const read = (): SavedChordsView => {
  try {
    return localStorage.getItem(KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useSavedChordsView() {
  const view = useSyncExternalStore(subscribe, read, () => "list" as const);
  const setView = useCallback((next: SavedChordsView) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);
  return [view, setView] as const;
}
