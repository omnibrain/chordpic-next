import { useRouter } from "next/router";
import { utsLocaleToLanguage } from "@magic-translate/react";

export function useLanguage() {
  const router = useRouter();

  return utsLocaleToLanguage(router.locale);
}
