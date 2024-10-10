import { Alert, AlertIcon, Box, Button, Link } from "@chakra-ui/react";
import * as React from "react";
import { useCallback } from "react";
import { SUPPORT_EMAIL } from "../../global";
import { defaultValues } from "../ChordForm";
import { ChordChart } from "./ChordChart";
import { useChart } from "./useChart";
import * as Sentry from "@sentry/react";

const ErrorFallback: React.FunctionComponent<{
  onReset(): void;
}> = ({ onReset }) => {
  return (
    <Box
      height="100%"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      flex="1"
      gap={4}
    >
      <Alert status="error">
        <AlertIcon />
        <Box>
          Oops, something went wrong with the chord diagram. If this keeps
          happening, please{" "}
          <Link href={`mailto:${SUPPORT_EMAIL}`}>contact support</Link>. To
          resolve the problem for now, please reset the settings.
        </Box>
      </Alert>
      <Button onClick={onReset}>Reset settings</Button>
    </Box>
  );
};

export const ChordResult: React.FunctionComponent = () => {
  const { setChart, chart } = useChart();

  const resetSettings = useCallback(() => {
    setChart({
      chord: chart.chord,
      settings: defaultValues,
    });
    window.location.reload();
  }, [chart.chord, setChart]);

  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback onReset={resetSettings} />}>
      <ChordChart />
    </Sentry.ErrorBoundary>
  );
};
