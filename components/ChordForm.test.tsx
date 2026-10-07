import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ChordForm, defaultValues } from "./ChordForm";
import { TooltipProvider } from "@/components/ui/tooltip";

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useT: () => (s: string) => s,
}));
jest.mock("../utils/useSubscription", () => ({
  useSubscription: () => undefined,
}));
jest.mock("./SliderWithTooltip", () => ({
  SliderWithTooltip: (props: { value?: number; "aria-label"?: string }) => (
    <output aria-label={props["aria-label"]}>{props.value}</output>
  ),
}));
jest.mock("./ColorInput", () => ({
  ColorInput: (props: { value?: string; onChange(color: string): void }) => (
    <button data-testid="color" onClick={() => props.onChange("green")}>
      {props.value}
    </button>
  ),
}));

it("keeps custom colors cleared after resetting the settings", async () => {
  const onSettings = jest.fn();
  render(
    <TooltipProvider>
      <ChordForm
        settings={{
          ...defaultValues,
          color: "red",
          backgroundColor: "blue",
          fretLabelColor: "green",
        }}
        onSettings={onSettings}
      />
    </TooltipProvider>,
  );

  fireEvent.click(screen.getByText(/Show more/));
  fireEvent.click(screen.getByText("Reset settings"));
  // Any later edit re-emits all settings, which used to bring the old colors back
  fireEvent.change(screen.getByPlaceholderText("Enter title"), {
    target: { value: "Am" },
  });
  await act(async () => {});

  const settings = onSettings.mock.calls.at(-1)[0];
  expect(settings.title).toBe("Am");
  expect(settings.color).toBeUndefined();
  expect(settings.backgroundColor).toBeUndefined();
  expect(settings.fretLabelColor).toBeUndefined();
  expect(screen.getAllByTestId("color").map((s) => s.textContent)).toEqual([
    "",
    "",
    "",
  ]);
});

it("lets you pick a new color after resetting the settings", async () => {
  const onSettings = jest.fn();
  render(
    <TooltipProvider>
      <ChordForm
        settings={{ ...defaultValues, backgroundColor: "blue" }}
        onSettings={onSettings}
      />
    </TooltipProvider>,
  );

  fireEvent.click(screen.getByText(/Show more/));
  fireEvent.click(screen.getByText("Reset settings"));
  fireEvent.click(screen.getAllByTestId("color")[1]);
  await act(async () => {});

  expect(onSettings.mock.calls.at(-1)[0].backgroundColor).toBe("green");
  expect(screen.getAllByTestId("color")[1].textContent).toBe("green");
});

it("shows the default values on the sliders of a new chart", () => {
  render(
    <TooltipProvider>
      <ChordForm
        settings={{ frets: 4, strings: 6, fretSize: 1.75 }}
        onSettings={jest.fn()}
      />
    </TooltipProvider>,
  );

  fireEvent.click(screen.getByText(/Show more/));

  expect(screen.getByLabelText("Chord chart height").textContent).toBe("1.75");
  expect(screen.getByLabelText("Chord chart finger size").textContent).toBe(
    String(defaultValues.fingerSize),
  );
  expect(screen.getByLabelText("Stroke width").textContent).toBe(
    String(defaultValues.strokeWidth),
  );
});
