import {
  Box,
  Container,
  Flex,
  GridItem,
  Link,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { FacebookIcon, RedditIcon } from "react-share";
import { T } from '@magic-translate/react'

export const Footer = () => {
  const bg = useColorModeValue("gray.100", "gray.900");

  return (
    <GridItem as="footer" bg={bg} display="flex" py={[8, 8, 4]}>
      <Container
        maxW="container.lg"
        display="flex"
        gap={5}
        flexDirection={["column", "column", "row"]}
      >
        <Link
          href="https://reddit.com/r/chordpic"
          display="flex"
          alignItems="center"
          gap={2}
          rel="noopener noreferrer"
          target="_blank"
        >
          <RedditIcon borderRadius={100} size="1.5em" /> Reddit
        </Link>
        <Link
          href="https://www.facebook.com/chordpic"
          display="flex"
          alignItems="center"
          gap={2}
          rel="noopener noreferrer"
          target="_blank"
        >
          <FacebookIcon borderRadius={100} size="1.5em" /> Facebook
        </Link>
        <Spacer />
        <Link href="/about"><T>About</T></Link>
        <Link href="/terms"><T>Terms of Use</T></Link>
        <Link href="/privacy-notice"><T>Privacy</T></Link>
      </Container>
    </GridItem>
  );
};
