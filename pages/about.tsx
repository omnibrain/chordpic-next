import { Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";

const HelpPage = () => {
  return (
    <>
      <Heading size="2xl" mb={6} as="h1">
        About
      </Heading>
      <Text mb={3}>
        ChordPic is a completely free tool to create guitar chord charts.
      </Text>
      <Text mb={3}>
        While many tools exist to create guitar chord charts, ChordPic is by far
        the fastest and easiest solution.
      </Text>
      <Heading size="lg" mb={3} id="feature-requests-or-bug-reports">
        Feature Requests or Bug Reports
      </Heading>
      <Text mb={3}>
        If you&apos;re missing an essential feature or found a bug,{" "}
        <Link href="https://gitlab.com/Voellmy/chordpic/issues">
          please create a ticket on GitLab
        </Link>{" "}
        or{" "}
        <Link href="mailto:incoming+voellmy-chordpic-13938802-issue-@incoming.gitlab.com">
          write us an email
        </Link>
        .
      </Text>
      <Heading size="lg" mb={3} id="privacy-notice">
        Privacy Notice
      </Heading>
      <Text mb={3}>
        <NextLink href="/privacy-notice" passHref>
          <Link>Read ChordPic&apos;s privacy notice here</Link>
        </NextLink>
        .
      </Text>
      <Heading size="lg" mb={3} id="cookie-policy">
        Cookie Policy
      </Heading>
      <Text mb={3}>
        {/* this is not a next link on purpose: The cookiefirst stuff will not load when routed with next */}
        <Link href="/cookie-policy">
          Read ChordPic&apos;s cookie policy or adjust your settings here
        </Link>
        .
      </Text>
    </>
  );
};

export default HelpPage;
