import {
  Box,
  Grid,
  GridItem,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const borderColor = useColorModeValue("black", "white");

  return (
    <>
      <Heading as="h1">Guitar Chord Diagram Creator</Heading>
      <Grid
        templateColumns={[
          "repeat(1, 1fr)",
          "repeat(1, 1fr)",
          "repeat(2, 1fr)",
          "repeat(2, 1fr)",
        ]}
        gap={6}
        mt={8}
      >
        <GridItem
          borderRadius="xl"
          borderColor={borderColor}
          borderStyle="solid"
          borderWidth="2px"
          display="block"
        >
          <Box p={3}>
            <Heading as="h2" size="md">
              Editor
            </Heading>
          </Box>
          <Box height="20rem"></Box>
        </GridItem>
        <GridItem
          borderRadius="xl"
          borderColor={borderColor}
          borderStyle="solid"
          borderWidth="2px"
          display="block"
        >
          <Box p={3}>
            <Heading as="h2" size="md">
              Result
            </Heading>
          </Box>
          <Box height="20rem"></Box>
        </GridItem>
      </Grid>
    </>
  );
};

export default Home;
