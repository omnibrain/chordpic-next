"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MagicTranslateProvider } from "@magic-translate/react";
import { MyUserContextProvider } from "@/utils/useUser";
import { useLanguage } from "@/utils/use-language";
import { useLocalizedRouter } from "@/utils/use-localized-router";
import { ChartProvider } from "@/components/chord/useChart";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { applyHashReferral } from "@/services/rewardful";

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const language = useLanguage();
  const router = useLocalizedRouter();

  useEffect(() => {
    const { data } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/new-password");
      }
    });
    return () => data?.unsubscribe();
  }, [router]);

  useEffect(() => {
    applyHashReferral();
    // Retire service workers left over from the original app.
    navigator.serviceWorker?.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
      <MagicTranslateProvider
        language={language}
        apiKey={process.env.NEXT_PUBLIC_MAGIC_TRANSLATE_API_KEY!}
      >
        <TooltipProvider>
          <UserProvider supabaseClient={supabaseClient}>
            <MyUserContextProvider supabaseClient={supabaseClient}>
              <ChartProvider>
                <Layout>{children}</Layout>
                <Toaster />
              </ChartProvider>
            </MyUserContextProvider>
          </UserProvider>
        </TooltipProvider>
      </MagicTranslateProvider>
    </QueryClientProvider>
  );
}
