import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SignIn from "./page-content";

const mockSignIn = jest.fn();

jest.mock("@supabase/supabase-auth-helpers/nextjs", () => ({
  supabaseClient: {
    auth: { signIn: (...args: unknown[]) => mockSignIn(...args) },
  },
}));

jest.mock("@supabase/supabase-auth-helpers/react", () => ({
  useUser: () => ({ user: null }),
}));

jest.mock("../../../utils/use-localized-router", () => ({
  useLocalizedRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("../../../components/LocalizedLink", () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => (
    <a href="#">{children}</a>
  ),
}));

jest.mock("@magic-translate/react", () => ({
  T: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useT: () => (text: string) => text,
}));

const sendMagicLink = async (email: string) => {
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: email },
  });
  await fireEvent.submit(
    screen.getByRole("button", { name: /send magic link/i }).closest("form")!,
  );
};

beforeEach(() => mockSignIn.mockResolvedValue({ error: null }));

it("replaces the form with a confirmation once the magic link is on its way", async () => {
  render(<SignIn />);

  await sendMagicLink("ross@example.com");

  expect(await screen.findByText("Magic link sent!")).not.toBeNull();
  expect(screen.getByText("ross@example.com")).not.toBeNull();
  expect(screen.queryByPlaceholderText("Email")).toBeNull();
  expect(screen.queryByRole("button", { name: /send magic link/i })).toBeNull();
});

it("keeps the form up when the link could not be sent", async () => {
  mockSignIn.mockResolvedValue({ error: { message: "Signups not allowed" } });
  render(<SignIn />);

  await sendMagicLink("ross@example.com");

  expect(await screen.findByText("Signups not allowed")).not.toBeNull();
  expect(screen.getByPlaceholderText("Email")).not.toBeNull();
});

it("goes back to the form to try another address", async () => {
  render(<SignIn />);

  await sendMagicLink("ross@example.com");
  fireEvent.click(
    await screen.findByRole("button", { name: /use a different email/i }),
  );

  const email = screen.getByPlaceholderText("Email") as HTMLInputElement;
  expect(email.value).toBe("ross@example.com");
  expect(screen.queryByText("Magic link sent!")).toBeNull();
});
