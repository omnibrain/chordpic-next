import { decompress } from "../hooks/compressed-state";
import { Chart } from "../domain/chart";

/**
 * The chart a /chord/… link carries, as the route hands the segment over.
 *
 * Percent-encoded, which matters: lz-string's alphabet includes `+`, and a `+`
 * reaches this as the three characters `%2B`. Decoding first is what makes the
 * majority of sharing links — any whose payload happens to contain one — work
 * at all.
 */
export function readChart(segment?: string): Chart | null {
  if (!segment) return null;

  try {
    return decompress<Chart>(decodeURIComponent(segment));
  } catch {
    // A stray % is not a valid escape; the raw segment is the better guess.
    return decompress<Chart>(segment);
  }
}

/** The chord's own name, when it was given one. */
export function chartName(chart: Chart | null): string | undefined {
  return chart?.settings.title?.trim() || undefined;
}
