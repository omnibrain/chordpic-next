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
jest.mock("./SliderWithTooltip", () => ({ SliderWithTooltip: () => null }));
jest.mock("./ColorInput", () => ({
  ColorInput: ({ value }: { value?: string }) => (
    <span data-testid="color">{value}</span>
  ),
}));

it("keeps custom colors cleared after resetting the settings", async () => {
  const onSettings = jest.fn();
  render(
    <TooltipProvider>
      <ChordForm
        settings={{ ...defaultValues, color: "red", backgroundColor: "blue" }}
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
  expect(screen.getAllByTestId("color").map((s) => s.textContent)).toEqual([
    "",
    "",
  ]);
});
