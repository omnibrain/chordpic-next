import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChordSearch } from "./ChordSearch";

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useT: () => (s: string) => s,
}));
// Drawing the diagrams is up to SVGuitar.
jest.mock("./ChordThumbnail", () => ({ ChordThumbnail: () => null }));

const settings = { strings: 6, frets: 5, title: "Old", color: "#f00" };

it("shows the matching chords and replaces the chart with the selected one", async () => {
  const onChart = jest.fn();
  render(<ChordSearch settings={settings} onChart={onChart} />);

  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "am" } });

  // every voicing of Am, then other chords starting with Am
  expect(
    await screen.findByRole("button", { name: "Am (1/4)" }),
  ).not.toBeNull();
  expect(screen.getByRole("button", { name: "Am (4/4)" })).not.toBeNull();
  expect(screen.getByRole("button", { name: /^Am7 / })).not.toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Am (2/4)" }));

  expect(onChart).toHaveBeenCalledWith(
    expect.objectContaining({
      settings: expect.objectContaining({
        title: "Am",
        strings: 6,
        frets: 4,
        color: "#f00",
      }),
    }),
    "Am",
  );
  // the search is done
  expect((input as HTMLInputElement).value).toBe("");
  expect(screen.queryByRole("button", { name: /^Am / })).toBeNull();
});

it("searches ukulele chords", async () => {
  const onChart = jest.fn();
  render(<ChordSearch settings={settings} onChart={onChart} />);

  fireEvent.click(screen.getByRole("button", { name: "Ukulele" }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "C" } });
  fireEvent.click(await screen.findByRole("button", { name: /^C \(1\// }));

  expect(onChart).toHaveBeenCalledWith(
    expect.objectContaining({
      chord: {
        fingers: [
          [4, 0],
          [3, 0],
          [2, 0],
          [1, 3, "3"],
        ],
        barres: [],
      },
      settings: expect.objectContaining({ title: "C", strings: 4 }),
    }),
    "C",
  );
});

it("says when no chord matches", async () => {
  render(<ChordSearch settings={settings} onChart={jest.fn()} />);

  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Hxyz" },
  });

  expect(await screen.findByText("No chords found")).not.toBeNull();
});

it("closes the results with escape", async () => {
  render(<ChordSearch settings={settings} onChart={jest.fn()} />);

  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "G" } });
  await screen.findByRole("button", { name: /^G \(1\// });
  fireEvent.keyDown(document, { keyCode: 27 });

  expect(screen.queryByRole("button", { name: /^G \(1\// })).toBeNull();
});
