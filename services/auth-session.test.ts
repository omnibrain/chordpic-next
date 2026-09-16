/** @jest-environment node */
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { refreshAccountSession } from "./auth-session";

jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }));

const refreshAccessToken = jest.fn();
const jwt = (exp: number) =>
  `header.${Buffer.from(JSON.stringify({ exp })).toString(
    "base64url",
  )}.signature`;
const requestWith = (token: string, hostname = "chordpic.com") =>
  new NextRequest(`https://${hostname}/account`, {
    headers: {
      cookie: `sb-access-token=${token}; sb-refresh-token=old-refresh; other=keep`,
    },
  });

beforeEach(() => {
  jest.clearAllMocks();
  (createClient as jest.Mock).mockReturnValue({
    auth: { api: { refreshAccessToken } },
  });
  refreshAccessToken.mockResolvedValue({
    data: { access_token: "new-access", refresh_token: "new-refresh" },
    error: null,
  });
});

it("does not refresh an active session or an anonymous request", async () => {
  await expect(
    refreshAccountSession(requestWith(jwt(Date.now() / 1000 + 3600))),
  ).resolves.toEqual([]);
  await expect(
    refreshAccountSession(new NextRequest("https://chordpic.com/account")),
  ).resolves.toEqual([]);
  expect(createClient).not.toHaveBeenCalled();
});

it("refreshes expired cookies for both the current page and the browser", async () => {
  const request = requestWith(jwt(Date.now() / 1000 - 60));
  const cookies = await refreshAccountSession(request);

  expect(refreshAccessToken).toHaveBeenCalledWith("old-refresh");
  expect(cookies).toEqual([
    expect.objectContaining({ name: "sb-access-token", value: "new-access" }),
    expect.objectContaining({ name: "sb-refresh-token", value: "new-refresh" }),
  ]);
  cookies.forEach((cookie) => {
    expect(cookie).toMatchObject({
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    expect(request.cookies.get(cookie.name)?.value).toBe(cookie.value);
    expect(request.headers.get("cookie")).toContain(
      `${cookie.name}=${cookie.value}`,
    );
  });
  expect(request.cookies.get("other")?.value).toBe("keep");
  expect(createClient).toHaveBeenCalledWith(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  );
});

it("refreshes just before expiry and recovers malformed access cookies", async () => {
  await refreshAccountSession(requestWith(jwt(Date.now() / 1000 + 5)));
  await refreshAccountSession(requestWith("invalid-jwt"));
  expect(refreshAccessToken).toHaveBeenCalledTimes(2);
});

it.each(["localhost", "127.0.0.1", "chordpic.local"])(
  "keeps auth cookies usable on the local host %s",
  async (hostname) => {
    const cookies = await refreshAccountSession(requestWith(jwt(0), hostname));
    expect(cookies.every((cookie) => !cookie.secure && cookie.httpOnly)).toBe(
      true,
    );
  },
);

it("does not overwrite cookies when Supabase rejects a refresh", async () => {
  refreshAccessToken.mockResolvedValue({
    data: null,
    error: new Error("expired"),
  });
  const request = requestWith(jwt(0));
  const originalCookies = request.headers.get("cookie");

  await expect(refreshAccountSession(request)).resolves.toEqual([]);
  expect(request.headers.get("cookie")).toBe(originalCookies);
});
