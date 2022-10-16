import {
  createContext,
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ChordSettings } from "svguitar";
import { Chart } from "../../domain/chart";
import { usePersistedState } from "../../hooks/use-persisted-state";

const LOCALSTORAGE_KEY = "chord_v1";

interface ChartContextType {
  chart: Chart;
  setChart: (chart: Chart) => void;
  resetSettings: () => void;
  size: { width: number; height: number };
  setSize(size: { width: number; height: number }): void;
  ref: MutableRefObject<HTMLDivElement | null>;
}

const defaultSVGuitarSettings: Partial<ChordSettings> = {
  fretSize: 1.75,
  barreChordRadius: 0.5,
  frets: 5,
  strings: 6,
};

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const ChartProvider: React.FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [chart, setChart] = usePersistedState<Chart>(LOCALSTORAGE_KEY, {
    chord: {
      fingers: [],
      barres: [],
    },
    settings: defaultSVGuitarSettings,
  });

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const resetSettings = useCallback(() => {
    setChart({
      chord: chart.chord,
      settings: defaultSVGuitarSettings,
    });
  }, [setChart, chart.chord]);

  return (
    <ChartContext.Provider
      value={{ chart, setChart, size, setSize, ref, resetSettings }}
    >
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error(`useChart must be used within a ChartProvider.`);
  }
  return context;
};
