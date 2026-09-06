import * as React from "react";
import { useEffect, useState } from "react";
import { TuningInput } from "./TuningInput";
import { ChordInput } from "./chord-input/ChordInput";
import { SilentStringsInput } from "./SilentStringsInput";
import { ChordSettings } from "svguitar";
import { EditModeInput } from "./EditModeInput";
import { Chart } from "../../domain/chart";
import { EditMode } from "../../domain/edit-mode";
import { ChordMatrix } from "../../services/chord-matrix";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GA } from '../../services/google-analytics'

const lineWidth = 3;

export interface IChordInputSettings {
  width: number;
  height: number;
  lineWidth: number;
  circleSize: number;
}

interface IProps {
  numFrets: number;
  numStrings: number;
  chord: Chart["chord"];
  settings: ChordSettings;
  onChart: (newChart: Chart) => void;
  width: number;
  height: number;
}

function resize<T>(arr: T[], newSize: number, defaultValue: T) {
  if (newSize > arr.length) {
    return [
      ...arr,
      ...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue),
    ];
  }

  return arr.slice(0, newSize);
}

export const ChordEditor = (props: IProps) => {
  const [matrix, setMatrix] = useState(
    ChordMatrix.fromChart({
      chord: props.chord,
      settings: props.settings,
    })
  );

  const [editMode, setEditMode] = useState(EditMode.EDIT_NOTES);

  useEffect(() => {
    matrix.setNumStrings(props.numStrings).setNumFrets(props.numFrets);
    setMatrix(matrix);

    // resize tuning array
    const tuning = resize(props.settings.tuning || [], props.numStrings, "");

    props.onChart({
      chord: matrix.toVexchord(),
      settings: {
        ...props.settings,
        tuning,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.numFrets, props.numStrings, matrix]);

  const { settings, numStrings, width, height } = props;

  const onMatrixChange = (newMatrix: ChordMatrix) => {
    // callback
    props.onChart({
      chord: newMatrix.toVexchord(),
      settings: props.settings,
    });

    setMatrix(newMatrix);
  };

  const onTuningChange = (tuning: string[]) =>
    props.onChart({
      chord: props.chord,
      settings: {
        ...props.settings,
        tuning,
      },
    });

  const onResetChord = () => {
    GA()?.("event", "reset_chord");
    const newMatrix = new ChordMatrix(props.numFrets, props.numStrings);
    props.onChart({
      chord: newMatrix.toVexchord(),
      settings: {
        ...props.settings,
        tuning: Array(props.settings.strings).fill(""),
      },
    });

    setMatrix(newMatrix);
  };

  const circleSize = Math.min(50, width / numStrings - 2);
  const displaySettings = { lineWidth, circleSize, width, height };

  return (
    <div>
      <div className="absolute right-3 top-3 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onResetChord}
              aria-label="Reset chord"
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset chord</TooltipContent>
        </Tooltip>
      </div>
      <SilentStringsInput
        settings={displaySettings}
        matrix={matrix}
        editMode={editMode}
        onMatrixChange={onMatrixChange}
        onEditModeChange={setEditMode}
      />
      <ChordInput
        matrix={matrix}
        settings={displaySettings}
        onMatrixChange={onMatrixChange}
        editMode={editMode}
        onEditModeChange={setEditMode}
      />
      <TuningInput
        settings={displaySettings}
        tunings={settings.tuning || emptyTunings(matrix.numStrings)}
        onTunings={onTuningChange}
        numStrings={numStrings}
      />
      <EditModeInput editMode={editMode} onEditModeChange={setEditMode} />
    </div>
  );
};

function emptyTunings(length: number): string[] {
  return Array.from({ length }, () => "");
}
