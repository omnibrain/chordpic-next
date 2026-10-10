import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { ChordSearch } from "./ChordSearch";

MotionGlobalConfig.skipAnimations = true;

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useT: () => (s: string) => s,
}));
// Drawing the diagrams is up to SVGuitar.
jest.mock("./ChordThumbnail", () => ({ ChordThumbnail: () => null }));

const settings = { strings: 6, frets: 5, title: "Old", color: "#f00" };

it("shows the voicings of the chord and replaces the chart with the selected one", async () => {
  const onChart = jest.fn();
  render(<ChordSearch settings={settings} onChart={onChart} />);

  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "am" } });

  // only Am, not the chords that start with Am
  expect(
    await screen.findByRole("button", { name: /^Am \(1\// }),
  ).not.toBeNull();
  expect(screen.queryByRole("button", { name: /^Am7 / })).toBeNull();
  expect(screen.queryByText(/^1\/\d+$/)).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: /^Am \(2\// }));

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
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: /^Am / })).toBeNull(),
  );
});

it("shows the voicings in pages of 12", async () => {
  render(<ChordSearch settings={settings} onChart={jest.fn()} />);

  // C has more than 12 voicings
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "C" } });
  await screen.findByRole("button", { name: /^C \(1\// });
  const tiles = () => screen.getAllByRole("button", { name: /^C \(/ });

  expect(tiles()).toHaveLength(12);
  const previous = screen.getByRole("button", { name: "Previous page" });
  const next = screen.getByRole("button", { name: "Next page" });
  expect((previous as HTMLButtonElement).disabled).toBe(true);

  fireEvent.click(next);

  expect(screen.getByRole("button", { name: /^C \(13\// })).not.toBeNull();
  expect(screen.queryByRole("button", { name: /^C \(1\// })).toBeNull();
  expect(screen.getByText("2 / 2")).not.toBeNull();
  expect((next as HTMLButtonElement).disabled).toBe(true);

  // a new search starts on the first page
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Cm" } });
  expect(
    await screen.findByRole("button", { name: /^Cm \(1\// }),
  ).not.toBeNull();
});

it("searches ukulele chords", async () => {
  const onChart = jest.fn();
  render(<ChordSearch settings={settings} onChart={onChart} />);

  fireEvent.focus(screen.getByRole("searchbox"));
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

it("opens when the search field is focused and closes with escape", async () => {
  render(<ChordSearch settings={settings} onChart={jest.fn()} />);

  expect(screen.queryByRole("button", { name: "Ukulele" })).toBeNull();
  fireEvent.focus(screen.getByRole("searchbox"));
  expect(screen.getByRole("button", { name: "Ukulele" })).not.toBeNull();

  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "G" } });
  await screen.findByRole("button", { name: /^G \(1\// });
  fireEvent.keyDown(document, { keyCode: 27 });

  await waitFor(() =>
    expect(screen.queryByRole("button", { name: /^G \(1\// })).toBeNull(),
  );
  // the query stays for the next time
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("G");
});
