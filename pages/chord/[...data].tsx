import {
  Button,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ChordResult } from "../../components/chord/ChordResult";
import { useChart } from "../../components/chord/useChart";
import { DownloadButtons } from "../../components/DownloadButtons";
import { ShareButtons } from "../../components/ShareButtons";
import { Chart } from "../../domain/chart";
import { decompress } from "../../hooks/compressed-state";

const ChordPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data } = router.query;

  const { setChart, chart } = useChart();

  useEffect(() => {
    const compressed = data && data.length ? data[0] : data;

    if (typeof compressed !== "string") {
      setIsLoading(false);
      return;
    }

    const loadedChart = decompress<Chart>(compressed);
    if (!loadedChart) {
      setIsLoading(false);
      return;
    }

    setChart(loadedChart);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!isLoading) {
    <Spinner />;
  }

  if (!chart) {
    return (
      <>
        <Heading size="lg">Invalid sharing link</Heading>
        <Text>
          Sorry but this link does not seem to be a valid sharing link. Are you
          sure you have the complete link?
        </Text>

        <Text>
          Anyway, all you can do now is{" "}
          <Link href="/">go back and create a new guitar chord chart</Link>.
        </Text>
      </>
    );
  }

  return (
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
        <ChordResult />
      </GridItem>
      <GridItem>
        <DownloadButtons />
        <ShareButtons chart={chart} />
        <Heading as="h2" size="lg" mb={3} mt={8}>
          Edit
        </Heading>
        <Link href="/" passHref legacyBehavior>
          <Button as="a" size="md" variant="solid">
            Edit this chord diagram
          </Button>
        </Link>
      </GridItem>
    </Grid>
  );
};

export default ChordPage;
