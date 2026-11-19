import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SubscriptionType } from "../../types";
import { SaveChord } from "./SaveChord";

jest.mock("@supabase/supabase-auth-helpers/nextjs", () => ({
  supabaseClient: {},
}));

jest.mock("../LocalizedLink", () => ({
  __esModule: true,
  default: ({ href, ...props }: { href: string }) => (
    <a href={href} {...props} />
  ),
}));

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useT: () => (text: string) => text,
}));

const push = jest.fn();
jest.mock("../../utils/use-localized-router", () => ({
  useLocalizedRouter: () => ({ push }),
}));

let mockUser: object | null = null;
jest.mock("../../utils/useUser", () => ({
  useUser: () => ({ user: mockUser, isLoading: false }),
}));

let mockSubscription = SubscriptionType.FREE;
jest.mock("../../utils/useSubscription", () => ({
  useSubscription: () => mockSubscription,
}));

const mockCount = jest.fn();
const mockSave = jest.fn();
jest.mock("../../services/saved-chords", () => ({
  ...jest.requireActual("../../services/saved-chords"),
  countSavedChords: () => mockCount(),
  saveChord: (...args: unknown[]) => mockSave(...args),
}));

const chart = {
  chord: { fingers: [], barres: [] },
  settings: { title: "Am7", style: "handdrawn" },
} as never;

const renderSave = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SaveChord chart={chart} />
    </QueryClientProvider>,
  );

const saveButton = () =>
  screen.getByRole("button", { name: /Save to my chords/ });

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockUser = null;
  mockSubscription = SubscriptionType.FREE;
});

it("sends signed-out visitors to sign in and resumes the save afterwards", async () => {
  const { unmount } = renderSave();
  fireEvent.click(saveButton());

  expect(push).toHaveBeenCalledWith("/signin?next=%2F");
  unmount();

  mockUser = { id: "user" };
  mockCount.mockResolvedValue(0);
  renderSave();

  expect((await screen.findByLabelText<HTMLInputElement>("Name")).value).toBe(
    "Am7",
  );
});

it("saves the whole chart under the chosen name", async () => {
  mockUser = { id: "user" };
  mockCount.mockResolvedValue(2);
  mockSave.mockResolvedValue(undefined);
  renderSave();

  fireEvent.click(saveButton());
  const name = await screen.findByLabelText<HTMLInputElement>("Name");
  expect(name.value).toBe("Am7");
  fireEvent.change(name, { target: { value: "My Am7" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => expect(mockSave).toHaveBeenCalledWith("My Am7", chart));
});

it("offers Pro instead once a free account has 3 chords", async () => {
  mockUser = { id: "user" };
  mockCount.mockResolvedValue(3);
  renderSave();

  fireEvent.click(saveButton());

  await screen.findByText("Your free chord slots are full");
  expect(
    screen.getByRole("link", { name: "Go Pro" }).getAttribute("href"),
  ).toBe("/pricing");
  expect(screen.queryByLabelText("Name")).toBeNull();
});

it("doesn't count for Pro accounts", async () => {
  mockUser = { id: "user" };
  mockSubscription = SubscriptionType.PRO;
  renderSave();

  fireEvent.click(saveButton());

  await screen.findByLabelText("Name");
  expect(mockCount).not.toHaveBeenCalled();
});
