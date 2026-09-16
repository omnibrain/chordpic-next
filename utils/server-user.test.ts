/** @jest-environment node */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "../services/auth-session";
import { requireUser } from "./server-user";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
jest.mock("../services/auth-session", () => ({ createAuthClient: jest.fn() }));

const getCookie = jest.fn();
const getUser = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (cookies as jest.Mock).mockResolvedValue({ get: getCookie });
  (createAuthClient as jest.Mock).mockReturnValue({
    auth: { api: { getUser } },
  });
  getCookie.mockReturnValue({ value: "access-token" });
});

it("returns only the user verified by Supabase", async () => {
  const user = { id: "user-1", email: "user@example.com" };
  getUser.mockResolvedValue({ user, error: null });

  await expect(requireUser("de")).resolves.toBe(user);
  expect(getUser).toHaveBeenCalledWith("access-token");
  expect(redirect).not.toHaveBeenCalled();
});

it.each([
  ["en", "/signin"],
  ["de", "/de/signin"],
])("redirects an anonymous %s request to %s", async (locale, destination) => {
  getCookie.mockReturnValue(undefined);

  await expect(requireUser(locale)).rejects.toThrow(`redirect:${destination}`);
  expect(createAuthClient).not.toHaveBeenCalled();
});

it("rejects a token when server verification fails", async () => {
  getUser.mockResolvedValue({ user: null, error: new Error("invalid token") });

  await expect(requireUser("fr")).rejects.toThrow("redirect:/fr/signin");
});
