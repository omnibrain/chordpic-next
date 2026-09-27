import { act, renderHook } from "@testing-library/react";
import { useConsentApiReady } from "./use-consent-api-ready";

describe("waiting for the consent API", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    delete (window as { __tcfapi?: unknown }).__tcfapi;
  });

  it("is ready on the first check when the banner loaded first", () => {
    (window as { __tcfapi?: unknown }).__tcfapi = () => {};

    const { result } = renderHook(() => useConsentApiReady());
    act(() => jest.advanceTimersByTime(50));

    expect(result.current).toBe(true);
  });

  it("becomes ready once the banner installs the API", () => {
    const { result } = renderHook(() => useConsentApiReady());
    expect(result.current).toBe(false);

    (window as { __tcfapi?: unknown }).__tcfapi = () => {};
    act(() => jest.advanceTimersByTime(100));

    expect(result.current).toBe(true);
  });

  it("never becomes ready if the banner does not load", () => {
    const { result } = renderHook(() => useConsentApiReady());

    act(() => jest.advanceTimersByTime(10_000));

    expect(result.current).toBe(false);
  });
});
