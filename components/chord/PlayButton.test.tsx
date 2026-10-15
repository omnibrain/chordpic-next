import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { playChord } from "@svguitar/play-plugin";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Chart } from "@/domain/chart";
import { PlayButton } from "./PlayButton";

jest.mock("@magic-translate/react", () => ({ useT: () => (text: string) => text }));
jest.mock("@svguitar/play-plugin", () => ({
  ...jest.requireActual("@svguitar/play-plugin"),
  playChord: jest.fn(() => ({ notes: [], finished: Promise.resolve(), stop: jest.fn() })),
}));

const openC: Chart = {
  chord: {
    fingers: [
      [6, "x"],
      [5, 3],
      [4, 2],
      [2, 1],
    ],
    barres: [],
  },
  settings: { strings: 6, frets: 5 },
};

const renderButton = (chart: Chart) =>
  render(
    <TooltipProvider delayDuration={0}>
      <PlayButton chart={chart} />
    </TooltipProvider>,
  );

const tooltipOf = async (element: HTMLElement) => {
  await act(async () => fireEvent.focus(element));
  return screen.getByRole("tooltip").textContent;
};

it("plays a guitar chord", async () => {
  renderButton(openC);
  const button = screen.getByRole("button", { name: "Play chord" });

  fireEvent.click(button);

  expect(playChord).toHaveBeenCalledWith(openC.chord, openC.settings);
  expect(await tooltipOf(button)).toBe("Play chord");
});

it("stops the previous playback when played again", () => {
  renderButton(openC);
  const button = screen.getByRole("button", { name: "Play chord" });

  fireEvent.click(button);
  fireEvent.click(button);

  const first = jest.mocked(playChord).mock.results.at(-2)!.value;
  expect(first.stop).toHaveBeenCalled();
});

it("asks to name the strings if their notes are unknown", async () => {
  const { container } = renderButton({ ...openC, settings: { strings: 5, frets: 5 } });

  expect(screen.getByRole("button", { name: "Play chord" })).toHaveProperty("disabled", true);
  expect(await tooltipOf(container.querySelector("span")!)).toBe("Name all strings to play");
});

it("can't play a guitar whose string names contradict its tuning", () => {
  renderButton({ ...openC, settings: { ...openC.settings, tuning: ["D"] } });

  expect(screen.getByRole("button", { name: "Play chord" })).toHaveProperty("disabled", true);
});

it("explains that muted strings can't be played", async () => {
  const muted: Chart = {
    chord: { fingers: [1, 2, 3, 4].map((string) => [string, "x"]), barres: [] },
    settings: { strings: 4, frets: 5 },
  };
  const { container } = renderButton(muted);

  expect(await tooltipOf(container.querySelector("span")!)).toBe("No strings to play");
});
