"use client";

import { MagicTranslateProvider } from "@magic-translate/react";
import type { Language } from "@magic-translate/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { ChartProvider } from "../components/chord/useChart";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { applyHashReferral } from "../services/rewardful";
import { localePath } from "../services/seo";
import { createClient } from "../utils/supabase/browser";
import { LanguageContext } from "../utils/use-language";
import { MyUserContextProvider } from "../utils/useUser";

/**
 * Everything _app.tsx used to wrap the page in. The language comes down from
 * the `[locale]` segment rather than from `router.locale`, which the App Router
 * does not have.
 */
export function Providers({
  children,
  language,
}: PropsWithChildren<{ language: `${Language}` }>) {
  // Created in state, not at module scope: a client shared between requests
  // would leak one user's cached subscription into another's render.
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace(localePath(language, "/new-password"));
      }
    });

    return () => subscription.unsubscribe();
  }, [router, language]);

  useEffect(() => {
    applyHashReferral();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
      <MagicTranslateProvider
        language={language}
        apiKey={process.env.NEXT_PUBLIC_MAGIC_TRANSLATE_API_KEY!!}
      >
        <LanguageContext.Provider value={language}>
        <TooltipProvider>
          <MyUserContextProvider>
            <ChartProvider>
              {children}
              <Toaster />
            </ChartProvider>
          </MyUserContextProvider>
        </TooltipProvider>
        </LanguageContext.Provider>
      </MagicTranslateProvider>
    </QueryClientProvider>
  );
}
