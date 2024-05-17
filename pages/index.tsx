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
import { T, useT } from "@magic-translate/react";
import type { NextPage } from "next";
import React, { useCallback } from "react";
import { Orientation } from "svguitar";
import { ChordEditor } from "../components/chord/ChordEditor";
import { ChordResult } from "../components/chord/ChordResult";
import { useChart } from "../components/chord/useChart";
import { AdjustableChordSettings, ChordForm } from "../components/ChordForm";
import { DownloadButtons } from "../components/DownloadButtons";
import { ShareButtons } from "../components/ShareButtons";
import { useIsClient } from "../hooks/use-is-client";
import { useResizeHandler } from "../hooks/use-resize-handler";
import { GA } from "../services/google-analytics";
import NextLink from "next/link";

const Home: NextPage = () => {
  const t = useT();
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
    [chart.chord, chart.settings, setChart],
  );

  return (
    <>
      <Heading as="h1">
        <T>Guitar Chord Diagram Creator</T>
      </Heading>
      <Text mt={4} fontSize="lg">
        <T>
          It&apos;s never been easier to create guitar chord diagrams! Start by
          clicking anywhere on the{" "}
          <a style={{ textDecoration: "underline" }} href="#editor">
            <i>editor</i>
          </a>{" "}
          fret board and immediately see the result on the{" "}
          <a style={{ textDecoration: "underline" }} href="#result">
            <i>result</i>
          </a>{" "}
          fret board. Then{" "}
          <a style={{ textDecoration: "underline" }} href="#download">
            download
          </a>{" "}
          and{" "}
          <a style={{ textDecoration: "underline" }} href="#share">
            share
          </a>{" "}
          your chord diagram.
        </T>
      </Text>
      <Text mt={2}>
        <NextLink href="/pricing" passHref legacyBehavior>
          <Link>
            <T>Get the Pro version (no ads, no watermark)</T>
          </Link>
        </NextLink>
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
                  transformOrigin="0 0"
                  top={8}
                  left={-2}
                  display="inline-block"
                >
                  <T>Editor</T>
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
                  transformOrigin="0 0"
                  top={8}
                  left={-2}
                  display="inline-block"
                >
                  <T>Result</T>
                </Heading>
                <Tooltip
                  placement="top"
                  label={t("Rotate chord diagram")}
                  aria-label={t("Rotate chord diagram")}
                  hasArrow={true}
                >
                  <IconButton
                    position="absolute"
                    right={3}
                    top={3}
                    aria-label={t("Rotate chord diagram")}
                    variant="outline"
                    icon={<RepeatIcon />}
                    onClick={() => {
                      GA()?.("event", "rotate_chord_diagram");
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
