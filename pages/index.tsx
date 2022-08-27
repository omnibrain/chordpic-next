import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  useColorModeValue,
  Text,
  Link,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { ChordEditor } from "../components/chord/ChordEditor";
import { ChordResult } from "../components/chord/ChordResult";
import { useChart } from "../components/chord/useChart";
import { ChordForm } from "../components/ChordForm";
import { useIsClient } from "../hooks/use-is-client";
import { useResizeHandler } from "../hooks/use-resize-handler";

const Home: NextPage = () => {
  const { width, height } = useResizeHandler();
  const borderColor = useColorModeValue("black", "white");
  const {
    setChart,
    chart: { chord, settings },
  } = useChart();

  const isClient = useIsClient();

  return (
    <>
      <Heading as="h1">Guitar Chord Diagram Creator</Heading>
      <Text mt={4} fontSize="lg">
        It's never been easier to create guitar chord diagrams! Start by
        clicking anywhere on the{" "}
        <Link href="#editor">
          <i>editor</i>
        </Link>{" "}
        fret board and immediately see the result on the{" "}
        <Link href="#result">
          <i>result</i>
        </Link>{" "}
        fret board. Then <Link href="#download">download</Link> and{" "}
        <Link color="teal.500" href="#share">
          share
        </Link>{" "}
        your chord diagram.
      </Text>
      {isClient && (
        <>
          <ChordForm
            settings={settings}
            onSettings={(newSettings) =>
              setChart({
                chord,
                settings: {
                  ...settings,
                  ...newSettings,
                },
              })
            }
          />
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
              <Box p={3} id="editor">
                <Heading
                  as="h2"
                  size="md"
                  transform={[null, null, null, "rotate(-45deg)"]}
                  transformOrigin="0 0"
                  position={[null, null, null, "relative"]}
                  top={8}
                  left={-2}
                >
                  Editor
                </Heading>
                <Center>
                  <ChordEditor
                    numFrets={settings.frets ?? 5}
                    numStrings={settings.strings ?? 6}
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
              <Box p={3} id="result" height="100%">
                <Heading
                  as="h2"
                  size="md"
                  transform={[null, null, null, "rotate(-45deg)"]}
                  transformOrigin="0 0"
                  position={[null, null, null, "relative"]}
                  top={8}
                  left={-2}
                >
                  Result
                </Heading>
                <ChordResult />
              </Box>
            </GridItem>
          </Grid>
        </>
      )}
    </>
  );
};

export default Home;
