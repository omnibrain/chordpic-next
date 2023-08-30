import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { utsLocaleToLanguage } from "@magic-translate/core";
import type { NextRequest } from "next/server";
import { languageMap } from "./utils/translate";
import { Language } from "@magic-translate/react-ssr";

const DEFAULT_LANG = Language.EN;
const supportedLocales = Object.keys(languageMap);

function getLocale(request: NextRequest) {
  const headers = [...request.headers.entries()].reduce(
    (acc, [k, v]) => ({ ...acc, [k]: v }),
    {},
  );
  let languages = new Negotiator({ headers }).languages();
  let defaultLocale = "en";
  let locales = new Set(languages.map((lang) => utsLocaleToLanguage(lang)));

  console.log({ supportedLocales });

  return match(languages, [...locales], defaultLocale);
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  const pathnameIsMissingLocale = supportedLocales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  const response = NextResponse.next();

  // Redirect if there is no locale
  const locale = getLocale(request);
  if (pathnameIsMissingLocale) {
    if (locale !== DEFAULT_LANG) {
      // e.g. incoming request is /products
      // The new URL is now /en-US/products
      return NextResponse.redirect(
        new URL(`/${locale}/${pathname}`, request.url),
      );
    } else {
      response.headers.set("Content-Language", DEFAULT_LANG);
    }
  } else {
    response.headers.set("Content-Language", pathname.split("/")[1]);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};
