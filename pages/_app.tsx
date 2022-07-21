import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { supabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import { UserProvider } from "@supabase/supabase-auth-helpers/react";
import { MyUserContextProvider } from "../utils/useUser";
import { Layout } from "../components/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <UserProvider supabaseClient={supabaseClient}>
        <MyUserContextProvider supabaseClient={supabaseClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MyUserContextProvider>
      </UserProvider>
    </ChakraProvider>
  );
}

export default MyApp;
