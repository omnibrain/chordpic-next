import * as React from "react";
import { useCallback } from "react";
import { SUPPORT_EMAIL } from "../../global";
import { defaultValues } from "../ChordForm";
import { ChordChart } from "./ChordChart";
import { useChart } from "./useChart";
import * as Sentry from "@sentry/react";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";

const ErrorFallback: React.FunctionComponent<{
  onReset(): void;
}> = ({ onReset }) => {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
      <Alert status="error">
        Oops, something went wrong with the chord diagram. If this keeps
        happening, please{" "}
        <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
          contact support
        </a>
        . To resolve the problem for now, please reset the settings.
      </Alert>
      <Button onClick={onReset}>Reset settings</Button>
    </div>
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
