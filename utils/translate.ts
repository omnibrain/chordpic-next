import { Language, setupT } from "@magic-translate/react";

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
} as const;

export const translate = setupT({
  apiKey: process.env.NEXT_PUBLIC_MAGIC_TRANSLATE_API_KEY!!,
});
