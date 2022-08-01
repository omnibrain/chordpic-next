import { Container, SimpleGrid } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { PropsWithChildren } from "react";
import { PageMeta } from "../types";
import { NavBar } from "./NavBar";

export interface LayoutProps {
  meta?: PageMeta;
}

export const Layout: React.FunctionComponent<
  PropsWithChildren<LayoutProps>
> = ({ children, meta: pageMeta }) => {
  const router = useRouter();

  const meta = {
    title: "Chordpic | Easily create guitar chord diagrams",
    description: "It has never been easier to create beautiful chord diagrams.",
    cardImage: "/logo.png",
    ...pageMeta,
  };

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <link href="/favicon.ico" rel="shortcut icon" />
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://chordpic.com${router.asPath}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.cardImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.cardImage} />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <SimpleGrid row={["100px", null]} spacing="40px">
        <NavBar />
        <Container maxW="container.lg" as="main" mb={12}>
          {children}
        </Container>
      </SimpleGrid>
    </>
  );
};
