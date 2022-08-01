import {
  createContext,
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { ChordSettings } from "svguitar";
import { Chart } from "../../domain/chart";

interface ChartContextType {
  chart: Chart;
  setChart: Dispatch<SetStateAction<Chart>>;
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
  const [chart, setChart] = useState<Chart>({
    chord: {
      fingers: [],
      barres: [],
    },
    settings: defaultSVGuitarSettings,
  });
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <ChartContext.Provider value={{ chart, setChart, size, setSize, ref }}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a ChartProvider.`);
  }
  return context;
};
