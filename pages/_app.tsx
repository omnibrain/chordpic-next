import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { MyUserContextProvider } from "../utils/useUser";
import { Layout } from "../components/Layout";
import { theme } from "../theme/theme";
import { useEffect } from "react";
import { supabase } from "../utils/supabase-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ChartProvider } from "../components/chord/useChart";

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/new-password");
      }
    });
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <UserProvider supabaseClient={supabaseClient}>
          <MyUserContextProvider supabaseClient={supabaseClient}>
            <ChartProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ChartProvider>
          </MyUserContextProvider>
        </UserProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
