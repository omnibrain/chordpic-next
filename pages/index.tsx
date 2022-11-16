import { RepeatIcon } from "@chakra-ui/icons";
import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Link,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useCallback } from "react";
import { Orientation } from "svguitar";
import { ChordEditor } from "../components/chord/ChordEditor";
import { ChordResult } from "../components/chord/ChordResult";
import { useChart } from "../components/chord/useChart";
import { AdjustableChordSettings, ChordForm } from "../components/ChordForm";
import { DownloadButtons } from "../components/DownloadButtons";
import { ShareButtons } from "../components/ShareButtons";
import { useIsClient } from "../hooks/use-is-client";
import { useResizeHandler } from "../hooks/use-resize-handler";

const Home: NextPage = () => {
  const { width, height } = useResizeHandler();
  const borderColor = useColorModeValue("black", "white");
  const { setChart, chart } = useChart();

  const isClient = useIsClient();

  const onSettings = useCallback(
    (newSettings: AdjustableChordSettings) =>
      setChart({
        chord: chart.chord,
        settings: {
          ...chart.settings,
          ...newSettings,
        },
      }),
    [chart.chord, chart.settings, setChart]
  );

  return (
    <>
      <Heading as="h1">Guitar Chord Diagram Creator</Heading>
      <Text mt={4} fontSize="lg">
        It&apos;s never been easier to create guitar chord diagrams! Start by
        clicking anywhere on the{" "}
        <Link href="#editor">
          <i>editor</i>
        </Link>{" "}
        fret board and immediately see the result on the{" "}
        <Link href="#result">
          <i>result</i>
        </Link>{" "}
        fret board. Then <Link href="#download">download</Link> and{" "}
        <Link href="#share">share</Link> your chord diagram.
      </Text>
      {isClient && (
        <>
          <ChordForm settings={chart.settings} onSettings={onSettings} />
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
              <Box p={3} id="editor" position="relative">
                <Heading
                  as="h2"
                  size="md"
                  transform={[null, null, null, "rotate(-45deg)"]}
                  transformOrigin="0 0"
                  position={[null, null, null, "relative"]}
                  top={8}
                  left={-2}
                  display="inline-block"
                >
                  Editor
                </Heading>
                <Center>
                  <ChordEditor
                    numFrets={chart.settings.frets ?? 5}
                    numStrings={chart.settings.strings ?? 6}
                    chord={chart.chord}
                    settings={chart.settings}
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
              <Box p={3} id="result" height="100%" position="relative">
                <Heading
                  as="h2"
                  size="md"
                  transform={[null, null, null, "rotate(-45deg)"]}
                  transformOrigin="0 0"
                  position={[null, null, null, "relative"]}
                  top={8}
                  left={-2}
                  display="inline-block"
                >
                  Result
                </Heading>
                <Tooltip
                  placement="top"
                  label="Rotate chord diagram"
                  aria-label="Rotate chord diagram"
                  hasArrow={true}
                >
                  <IconButton
                    position="absolute"
                    right={3}
                    top={3}
                    aria-label="Rotate chord diagram"
                    variant="outline"
                    icon={<RepeatIcon />}
                    onClick={() => {
                      gtag?.("event", "rotate_chord_diagram");
                      setChart({
                        ...chart,
                        settings: {
                          ...chart.settings,
                          orientation:
                            chart.settings.orientation ===
                            Orientation.horizontal
                              ? Orientation.vertical
                              : Orientation.horizontal,
                        },
                      });
                    }}
                  />
                </Tooltip>
                <ChordResult />
              </Box>
            </GridItem>
          </Grid>
        </>
      )}
      <Grid
        templateColumns={[
          "repeat(1, 1fr)",
          "repeat(1, 1fr)",
          "repeat(2, 1fr)",
          "repeat(2, 1fr)",
        ]}
        gap={6}
      >
        <GridItem>
          <DownloadButtons title={chart.settings.title} />
        </GridItem>
        <GridItem>
          <ShareButtons chart={chart} />
        </GridItem>
      </Grid>
    </>
  );
};

export default Home;
