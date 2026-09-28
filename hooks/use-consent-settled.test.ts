import { act, renderHook } from "@testing-library/react";
import { useConsentSettled } from "./use-consent-settled";

type Listener = (
  data: { eventStatus: string; listenerId: number },
  success: boolean,
) => void;

/** A stand-in for the banner's TCF API that lets a test fire consent events. */
function installConsentApi() {
  const listeners: Listener[] = [];
  const removed: number[] = [];
  (window as { __tcfapi?: unknown }).__tcfapi = (
    command: string,
    _version: number,
    callback: Listener,
    parameter?: number,
  ) => {
    if (command === "addEventListener") listeners.push(callback);
    if (command === "removeEventListener") removed.push(parameter!);
  };
  const emit = (eventStatus: string) =>
    act(() =>
      listeners.forEach((l) => l({ eventStatus, listenerId: 7 }, true)),
    );
  return { emit, removed };
}

describe("waiting for consent to settle", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    delete (window as { __tcfapi?: unknown }).__tcfapi;
  });

  it("waits while the banner is open and settles once the visitor answers", () => {
    const { emit } = installConsentApi();
    const { result } = renderHook(() => useConsentSettled());
    act(() => jest.advanceTimersByTime(50));

    emit("cmpuishown");
    expect(result.current).toBe(false);

    emit("useractioncomplete");
    expect(result.current).toBe(true);
  });

  it("settles at once for a stored answer or where GDPR does not apply", () => {
    const { emit } = installConsentApi();
    const { result } = renderHook(() => useConsentSettled());
    act(() => jest.advanceTimersByTime(50));

    emit("tcloaded");

    expect(result.current).toBe(true);
  });

  it("picks up a banner that loads after the page", () => {
    const { result } = renderHook(() => useConsentSettled());
    act(() => jest.advanceTimersByTime(500));

    const { emit } = installConsentApi();
    act(() => jest.advanceTimersByTime(50));
    emit("tcloaded");

    expect(result.current).toBe(true);
  });

  it("never settles if the banner does not load", () => {
    const { result } = renderHook(() => useConsentSettled());

    act(() => jest.advanceTimersByTime(10_000));

    expect(result.current).toBe(false);
  });

  it("stops listening on unmount", () => {
    const { emit, removed } = installConsentApi();
    const { unmount } = renderHook(() => useConsentSettled());
    act(() => jest.advanceTimersByTime(50));
    emit("cmpuishown");

    unmount();

    expect(removed).toEqual([7]);
  });
});
