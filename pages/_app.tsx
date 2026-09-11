import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { MyUserContextProvider } from "../utils/useUser";
import { Layout } from "../components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import "../styles/globals.css";
import { supabase } from "../utils/supabase-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ChartProvider } from "../components/chord/useChart";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  MagicTranslateProvider,
  utsLocaleToLanguage,
} from "@magic-translate/react";
import { useLanguage } from "../utils/use-language";
import Head from "next/head";
import {
  DEFAULT_LOCALE,
  isNoindexPath,
  localeUrl,
  PUBLIC_LOCALES,
} from "../services/seo";
import { applyHashReferral } from "../services/rewardful";

// unregister all previous service workers
if (typeof navigator !== "undefined") {
  navigator.serviceWorker?.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// Create a client
const queryClient = new QueryClient();

function MyApp({
  Component,
  pageProps,
}: AppProps<{ title?: string; description?: string }>) {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/new-password");
      }
    });
  }, [router]);
  useEffect(() => {
    applyHashReferral();
  }, []);
  const language = useLanguage();

  return (
    <QueryClientProvider client={queryClient}>
      {/* on <html> so Radix portals rendered into <body> inherit the font */}
      <style jsx global>{`
        html {
          font-family: ${GeistSans.style.fontFamily};
          --font-geist-sans: ${GeistSans.style.fontFamily};
        }
      `}</style>
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
      <MagicTranslateProvider
        language={language}
        apiKey={process.env.NEXT_PUBLIC_MAGIC_TRANSLATE_API_KEY!!}
      >
        <Head>
          {/*
            Emitted for indexable pages only, and including the current locale:
            Google requires an hreflang cluster to be self-referencing, and had
            been discarding this one for listing only the *other* languages.
          */}
          {!isNoindexPath(router.asPath) && (
            <>
              {PUBLIC_LOCALES.map((lang) => (
                <link
                  key={lang}
                  rel="alternate"
                  hrefLang={lang}
                  href={localeUrl(lang, router.asPath)}
                />
              ))}
              <link
                rel="alternate"
                hrefLang="x-default"
                href={localeUrl(DEFAULT_LOCALE, router.asPath)}
              />
            </>
          )}
        </Head>
        <TooltipProvider>
          <UserProvider supabaseClient={supabaseClient}>
            <MyUserContextProvider supabaseClient={supabaseClient}>
              <ChartProvider>
                <Layout meta={pageProps}>
                  <Component {...pageProps} />
                </Layout>
                <Toaster />
              </ChartProvider>
            </MyUserContextProvider>
          </UserProvider>
        </TooltipProvider>
      </MagicTranslateProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
