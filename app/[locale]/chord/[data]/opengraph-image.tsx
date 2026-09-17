import { PREVIEW_SIZE, renderChordPng } from "@/services/chord-image";
import { readChart } from "@/services/chord-link";

export const alt = "A guitar chord diagram created with ChordPic";
export const size = PREVIEW_SIZE;
export const contentType = "image/png";

/** The diagram itself, so a shared link previews as the chord it points at. */
export default async function Image({
  params,
}: {
  params: Promise<{ data?: string }>;
}) {
  const { data } = await params;
  const chart = readChart(data);

  if (!chart) {
    // Nothing to draw; the link's own page explains itself.
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(await renderChordPng(chart)), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
