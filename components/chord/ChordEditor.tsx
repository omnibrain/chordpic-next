import * as React from "react";
import { useEffect, useState } from "react";
import { TuningInput } from "./TuningInput";
import { ChordInput } from "./chord-input/ChordInput";
import { SilentStringsInput } from "./SilentStringsInput";
import { Chord, ChordSettings } from "svguitar";
import { EditModeInput } from "./EditModeInput";
import { Chart } from "../../domain/chart";
import { EditMode } from "../../domain/edit-mode";
import { ChordMatrix } from "../../services/chord-matrix";
import { Box } from "@chakra-ui/react";

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
  chord: Chord;
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
  // For some reason styled components sometimes does not reflect the actual state when the
  // application is loaded offline with workbox. Seems to be this problem:
  // https://github.com/styled-components/styled-components/issues/2629
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

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
    <Box>
      <SilentStringsInput
        settings={displaySettings}
        matrix={matrix}
        onMatrixChange={onMatrixChange}
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
    </Box>
  );
};

function emptyTunings(length: number): string[] {
  return Array.from({ length }, () => "");
}
