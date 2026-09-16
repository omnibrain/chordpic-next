/** @jest-environment node */

import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import { refreshAccountSession } from "./services/auth-session";

jest.mock("./services/auth-session", () => ({
  refreshAccountSession: jest.fn().mockResolvedValue([]),
}));

beforeEach(() => jest.clearAllMocks());

it("rewrites English URLs while preserving the query and ads assignment", async () => {
  const response = await proxy(
    new NextRequest("https://chordpic.com/news?ref=menu"),
  );
  expect(response.headers.get("x-middleware-rewrite")).toBe(
    "https://chordpic.com/en/news?ref=menu",
  );
  expect(response.cookies.get("cp_ads")?.value).toMatch(/^(on|off)$/);
  expect(response.cookies.get("cp_bucket")).toBeDefined();
});

it("keeps explicitly localized routes and skips session work for public pages", async () => {
  const response = await proxy(new NextRequest("https://chordpic.com/de/news"));
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(refreshAccountSession).not.toHaveBeenCalled();
});

it("redirects explicit English URLs to the canonical URL without changing the language", async () => {
  const response = await proxy(
    new NextRequest("https://chordpic.com/en?ref=menu"),
  );
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe(
    "https://chordpic.com/?ref=menu",
  );
  expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("en");
});

it("detects the browser language only on the home page and honors the saved choice", async () => {
  const detected = await proxy(
    new NextRequest("https://chordpic.com/", {
      headers: { "accept-language": "de-CH,de;q=0.9" },
    }),
  );
  expect(detected.headers.get("location")).toBe("https://chordpic.com/de");
  const chosen = await proxy(
    new NextRequest("https://chordpic.com/", {
      headers: { "accept-language": "de-CH", cookie: "NEXT_LOCALE=en" },
    }),
  );
  expect(chosen.headers.get("x-middleware-rewrite")).toBe(
    "https://chordpic.com/en",
  );
});

it.each(["/account", "/de/account"])(
  "forwards refreshed session cookies on %s",
  async (path) => {
    jest
      .mocked(refreshAccountSession)
      .mockImplementationOnce(async (request) => {
        request.cookies.set("sb-access-token", "refreshed");
        return [
          {
            name: "sb-access-token",
            value: "refreshed",
            maxAge: 3600,
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
          },
        ];
      });
    const response = await proxy(
      new NextRequest(`https://chordpic.com${path}`),
    );
    expect(response.cookies.get("sb-access-token")?.value).toBe("refreshed");
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "sb-access-token=refreshed",
    );
  },
);
