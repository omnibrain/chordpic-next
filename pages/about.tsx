import { Heading, Link, Text } from "@chakra-ui/react";
import { GetStaticPropsResult } from "next";
import NextLink from "next/link";
import { T } from "@magic-translate/react";

interface Props {
  title: string;
  description: string;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      title: "About",
      description:
        "ChordPic is a free guitar chord diagram creator. You can create beautiful chord diagrams for free. If you want to use ChordPic for commercial purposes, you can upgrade to a paid plan.",
    },
  };
}

const HelpPage = () => {
  return (
    <>
      <Heading size="2xl" mb={6} as="h1">
        <T>About</T>
      </Heading>
      <Text mb={3}>
        <T>ChordPic is a completely free tool to create guitar chord charts.</T>
      </Text>
      <Text mb={3}>
        <T>
          While many tools exist to create guitar chord charts, ChordPic is by
          far the fastest and easiest solution.
        </T>
      </Text>
      <Heading size="lg" mb={3} id="feature-requests-or-bug-reports">
        <T>Feature Requests or Bug Reports</T>
      </Heading>
      <Text mb={3}>
        <T>
          If you&apos;re missing an essential feature or found a bug,{" "}
          <a
            href="https://gitlab.com/Voellmy/chordpic/issues"
            style={{ textDecoration: "underline" }}
          >
            please create a ticket on GitLab
          </a>{" "}
          or{" "}
          <a
            href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com"
            style={{ textDecoration: "underline" }}
          >
            write us an email
          </a>
          .
        </T>
      </Text>
      <Heading size="lg" mb={3} id="privacy-notice">
        <T>Privacy Notice</T>
      </Heading>
      <Text mb={3}>
        <NextLink href="/privacy-notice" passHref legacyBehavior>
          <Link>
            <T>Read ChordPic&apos;s privacy notice here.</T>
          </Link>
        </NextLink>
      </Text>
      <Heading size="lg" mb={3} id="cookie-policy">
        <T>Cookie Policy</T>
      </Heading>
      <Text mb={3}>
        {/* this is not a next link on purpose: The cookiefirst stuff will not load when routed with next */}
        <Link href="/cookie-policy">
          <T>
            Read ChordPic&apos;s cookie policy or adjust your settings here.
          </T>
        </Link>
      </Text>
    </>
  );
};

export default HelpPage;
