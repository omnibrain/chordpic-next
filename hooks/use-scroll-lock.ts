import { useEffect } from "react";

/**
 * Stops the page from scrolling on touch devices while `locked`. iOS Safari
 * ignores `overflow: hidden` on the body, so the body is pinned in place
 * instead and the scroll position restored afterwards.
 */
export const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked || !window.matchMedia?.("(pointer: coarse)").matches) return;

    const { body } = document;
    const scrollY = window.scrollY;
    const previous = body.style.cssText;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";

    return () => {
      body.style.cssText = previous;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [locked]);
};
