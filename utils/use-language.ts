"use client";

import { useParams } from "next/navigation";
import { utsLocaleToLanguage } from "@magic-translate/react";

export function useLanguage() {
  const params = useParams<{ locale: string }>();

  return utsLocaleToLanguage(params?.locale);
}
