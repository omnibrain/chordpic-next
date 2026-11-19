import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import type { Chart } from "../domain/chart";

/** Enforced by the database too, see the saved_chords migration. */
export const FREE_SAVED_CHORDS_LIMIT = 3;
export const SAVED_CHORDS_PAGE_SIZE = 50;

export interface SavedChord {
  id: string;
  name: string;
  chart: Chart;
  created_at: string;
}

export type SavedChordsSort = "created_at" | "name";
export type SortDirection = "asc" | "desc";

export interface SavedChordsQuery {
  search: string;
  sort: SavedChordsSort;
  direction: SortDirection;
}

export class SavedChordsLimitError extends Error {
  constructor() {
    super("SAVED_CHORDS_LIMIT");
  }
}

const table = () => supabaseClient.from<SavedChord>("saved_chords");

/** Match `search` literally inside a LIKE pattern. */
export function likePattern(search: string): string {
  return `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function fetchSavedChords(
  { search, sort, direction }: SavedChordsQuery,
  page: number,
): Promise<SavedChord[]> {
  const ascending = direction === "asc";
  const from = page * SAVED_CHORDS_PAGE_SIZE;
  let query = table()
    .select("id, name, chart, created_at")
    // name_sort is lower(name); the id keeps pages stable among equal keys
    .order(sort === "name" ? ("name_sort" as keyof SavedChord) : "created_at", {
      ascending,
    })
    .order("id", { ascending })
    .range(from, from + SAVED_CHORDS_PAGE_SIZE - 1);

  if (search.trim()) {
    query = query.ilike("name", likePattern(search.trim()));
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function countSavedChords(): Promise<number> {
  const { count, error } = await table().select("id", {
    count: "exact",
    head: true,
  });
  if (error) throw error;
  return count ?? 0;
}

export async function saveChord(name: string, chart: Chart): Promise<void> {
  const { error } = await table().insert(
    { name: name.trim(), chart },
    { returning: "minimal" },
  );
  if (error?.message.includes("SAVED_CHORDS_LIMIT")) {
    throw new SavedChordsLimitError();
  }
  if (error) throw error;
}

export async function renameSavedChord(id: string, name: string) {
  const { error } = await table()
    .update({ name: name.trim() }, { returning: "minimal" })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSavedChord(id: string) {
  const { error } = await table().delete({ returning: "minimal" }).eq("id", id);
  if (error) throw error;
}

const PENDING_SAVE_KEY = "pending_save_chord";
const PENDING_SAVE_MAX_AGE = 24 * 60 * 60 * 1000;

/** Remember a save that has to wait for the visitor to sign in first. */
export function markPendingSave() {
  try {
    localStorage.setItem(PENDING_SAVE_KEY, String(Date.now()));
  } catch {}
}

/** True once, if a save is waiting and was asked for recently. */
export function takePendingSave(): boolean {
  try {
    const at = Number(localStorage.getItem(PENDING_SAVE_KEY));
    localStorage.removeItem(PENDING_SAVE_KEY);
    return Date.now() - at < PENDING_SAVE_MAX_AGE;
  } catch {
    return false;
  }
}
