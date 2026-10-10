import { act, renderHook } from "@testing-library/react";
import { useVisualViewport } from "./use-visual-viewport";

afterEach(() => {
  delete (window as { visualViewport?: VisualViewport }).visualViewport;
});

it("follows the visible part of the page, e.g. above the iOS keyboard", () => {
  const viewport = Object.assign(new EventTarget(), {
    offsetTop: 0,
    height: 844,
  });
  Object.defineProperty(window, "visualViewport", {
    value: viewport,
    configurable: true,
  });

  const { result } = renderHook(() => useVisualViewport());
  expect(result.current).toEqual({ top: 0, height: 844 });

  act(() => {
    viewport.offsetTop = 120;
    viewport.height = 480;
    viewport.dispatchEvent(new Event("resize"));
  });

  expect(result.current).toEqual({ top: 120, height: 480 });
});

it("is undefined without the visual viewport API", () => {
  const { result } = renderHook(() => useVisualViewport());

  expect(result.current).toBeUndefined();
});
