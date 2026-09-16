import { useEffect, useState } from "react";

/**
 * Padding of the container
 */
const PADDING = 15;

/**
 * Maximum width of the chord chart
 */
const MAX_WIDTH = 400;

export const useResizeHandler = () => {
  // Measured after mount rather than during render: the server has no screen to
  // read, and a first client render that disagrees with the server's HTML would
  // break hydration of the editor.
  const [screenWidth, setScreenWidth] = useState(MAX_WIDTH);

  useEffect(() => {
    const measure = () => setScreenWidth(window.screen.availWidth);
    measure();

    const handleResize = () => window.requestAnimationFrame(measure);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const finalWidth = Math.min(screenWidth, MAX_WIDTH) - PADDING * 2;

  return { width: finalWidth, height: finalWidth * 1.5 };
};
