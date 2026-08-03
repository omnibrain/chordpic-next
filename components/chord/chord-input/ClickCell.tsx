import React from "react";
import { EditMode } from "../../../domain/edit-mode";
import { Cell, CellState } from "../../../services/chord-matrix";

interface IClickCellProps extends React.HTMLAttributes<HTMLDivElement> {
  circleSize: number;
  cell: Cell;
  editMode: EditMode;
}

const stateClasses: Partial<Record<CellState, string>> = {
  [CellState.MIDDLE_HL]: "active hl-middle",
  [CellState.LEFT_HL]: "active hl-left",
  [CellState.RIGHT_HL]: "active hl-right",
};

/**
 * A single clickable cell of the editor fretboard. The circle size is passed
 * as a CSS variable because the highlight is drawn with a pseudo-element
 * (see .click-cell in globals.css).
 */
export const ClickCell: React.FunctionComponent<IClickCellProps> = ({
  circleSize,
  cell,
  editMode,
  ...props
}) => {
  const stateClass =
    cell.state === CellState.INACTIVE
      ? ""
      : (stateClasses[cell.state] ?? "active");

  return (
    <div
      className={`click-cell ${stateClass}`}
      style={{ "--circle-size": `${circleSize}px` } as React.CSSProperties}
      {...props}
    />
  );
};
