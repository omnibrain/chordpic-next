import React from "react";
import { ChordMatrix, EmptyStringState } from "../../services/chord-matrix";
import { IChordInputSettings } from "./ChordEditor";

interface IProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  onMatrixChange: (newMatrix: ChordMatrix) => void;
}

/**
 * Row of toggles above the fretboard to mark strings as open ("O") or
 * silent ("X"). The marks are drawn with pseudo-elements (see .string-cell
 * in globals.css) sized via the --circle-size CSS variable.
 */
export const SilentStringsInput = ({
  matrix,
  settings,
  onMatrixChange,
}: IProps) => (
  <div
    style={{
      display: "grid",
      width: settings.width,
      gridTemplateColumns: `repeat(${matrix.numStrings}, 1fr)`,
      gridRowGap: settings.lineWidth,
      gridTemplateRows: `${settings.height / 4}px`,
    }}
  >
    {matrix.getEmptyStringStates().map((state, i) => (
      <div
        key={i}
        className={`string-cell ${
          state !== EmptyStringState.NOT_EMPTY
            ? state === EmptyStringState.X
              ? "silent"
              : "open"
            : ""
        }`}
        style={
          { "--circle-size": `${settings.circleSize}px` } as React.CSSProperties
        }
        onClick={() => onMatrixChange(matrix.toggleEmptyState(i))}
        data-cell-index={i}
      />
    ))}
  </div>
);
