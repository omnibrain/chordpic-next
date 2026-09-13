// @magic-translate/react is marked "use client" since 1.17, so importing
// Language or setupT from it makes this module unusable in a server component —
// and page metadata, the sitemap and every <T> on the server go through here.
// @magic-translate/core is the same code without the React layer.
import { Language, setupT } from "@magic-translate/core";

export const languageMap: Partial<
  Record<Language, { name: string; icon: string }>
> = {
  [Language.EN]: { name: "English", icon: "🇬🇧" },
  [Language.ES]: { name: "Spanish", icon: "🇪🇸" },
  [Language.PT]: { name: "Portuguese", icon: "🇵🇹" },
  [Language.HI]: { name: "Hindi", icon: "🇮🇳" },
  [Language.ZH]: { name: "Chinese", icon: "🇨🇳" },
  [Language.IT]: { name: "Italian", icon: "🇮🇹" },
  [Language.FR]: { name: "French", icon: "🇫🇷" },
  [Language.RU]: { name: "Russian", icon: "🇷🇺" },
  [Language.DE]: { name: "German", icon: "🇩🇪" },
  [Language.NL]: { name: "Dutch", icon: "🇳🇱" },
  [Language.AR]: { name: "Arabic", icon: "🇸🇦" },
  [Language.FA]: { name: "Persian", icon: "🇮🇷" },
  [Language.UR]: { name: "Urdu", icon: "🇵🇰" },
} as const;

/**
 * Languages written right to left. The layout has to be mirrored for these, not
 * just translated — see the `dir` attribute in pages/_document.tsx.
 */
export const RTL_LANGUAGES: readonly Language[] = [
  Language.AR,
  Language.FA,
  Language.UR,
];

export function isRtl(language: string | undefined): boolean {
  return RTL_LANGUAGES.includes(language as Language);
}

export const translate = setupT({
  apiKey: process.env.NEXT_PUBLIC_MAGIC_TRANSLATE_API_KEY!!,
});
