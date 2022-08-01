import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { ChordEditor } from "../components/chord/ChordEditor";
import { ChordResult } from "../components/chord/ChordResult";
import { useChart } from "../components/chord/useChart";
import { useResizeHandler } from "../hooks/use-resize-handler";

const Home: NextPage = () => {
  const { width, height } = useResizeHandler();
  const borderColor = useColorModeValue("black", "white");
  const {
    setChart,
    chart: { chord, settings },
  } = useChart();

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
          borderColor="primary"
          borderStyle="solid"
          borderWidth="2px"
          display="block"
        >
          <Box p={3}>
            <Heading as="h2" size="md">
              Editor
            </Heading>
            <Center>
              <ChordEditor
                numFrets={5}
                numStrings={6}
                chord={chord}
                settings={settings}
                onChart={setChart}
                width={width * 0.9}
                height={height * 0.6}
              />
            </Center>
          </Box>
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
            <ChordResult />
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};

export default Home;
