import { useSyncExternalStore } from "react";

export interface ViewportBox {
  top: number;
  height: number;
}

const subscribe = (onChange: () => void) => {
  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", onChange);
  viewport?.addEventListener("scroll", onChange);
  return () => {
    viewport?.removeEventListener("resize", onChange);
    viewport?.removeEventListener("scroll", onChange);
  };
};

const snapshot = () => {
  const viewport = window.visualViewport;
  return viewport ? `${viewport.offsetTop}:${viewport.height}` : null;
};

/**
 * The part of the layout viewport that is actually visible. On iOS the
 * on-screen keyboard covers the bottom of the page without resizing it, so
 * anything fixed to the bottom has to be placed with this to stay visible.
 */
export const useVisualViewport = (): ViewportBox | undefined => {
  const box = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!box) return undefined;

  const [top, height] = box.split(":").map(Number);
  return { top, height };
};
