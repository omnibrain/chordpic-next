import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ChordResult } from "../../components/chord/ChordResult";
import { useChart } from "../../components/chord/useChart";
import { DownloadButtons } from "../../components/DownloadButtons";
import { ShareButtons } from "../../components/ShareButtons";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
    <Loader2 className="animate-spin" />;
  }

  if (!chart) {
    return (
      <>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Invalid sharing link
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sorry but this link does not seem to be a valid sharing link. Are you
          sure you have the complete link?
        </p>

        <p className="mt-3">
          Anyway, all you can do now is{" "}
          <Link href="/" className="font-medium underline underline-offset-4">
            go back and create a new guitar chord chart
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <ChordResult />
      </div>
      <div>
        <DownloadButtons />
        <ShareButtons chart={chart} />
        <h2 className="mb-3 mt-8 font-heading text-2xl font-semibold tracking-tight">
          Edit
        </h2>
        <Link href="/" className={buttonVariants()}>
          Edit this chord diagram
        </Link>
      </div>
    </div>
  );
};

export default ChordPage;
