import { renderHook } from "@testing-library/react";
import { useScrollLock } from "./use-scroll-lock";

const pointer = (coarse: boolean) => {
  window.matchMedia = jest
    .fn()
    .mockReturnValue({ matches: coarse }) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  document.body.style.cssText = "";
  window.scrollTo = jest.fn();
  Object.defineProperty(window, "scrollY", { value: 300, configurable: true });
});

it("pins the body on touch devices and restores the scroll position", () => {
  pointer(true);
  const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
    initialProps: { locked: true },
  });

  expect(document.body.style.position).toBe("fixed");
  expect(document.body.style.top).toBe("-300px");

  rerender({ locked: false });

  expect(document.body.style.position).toBe("");
  expect(window.scrollTo).toHaveBeenCalledWith(0, 300);
});

it("leaves the page alone with a mouse", () => {
  pointer(false);
  renderHook(() => useScrollLock(true));

  expect(document.body.style.position).toBe("");
});
