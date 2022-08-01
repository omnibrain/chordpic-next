import styled from "@emotion/styled";
import { EditMode } from "../../../domain/edit-mode";
import { Cell, CellState } from "../../../services/chord-matrix";

interface IClickCellProps {
  circleSize: number;
  cell: Cell;
  editMode: EditMode;
}

export const ClickCell = styled.div<IClickCellProps>(
  ({ circleSize, cell }) => `

  background-color: transparent;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  overflow: hidden;
  outline: none;
  position: relative;
  cursor: pointer;
  user-drag: none;
  user-select: none;

  ${
    cell.state !== CellState.INACTIVE
      ? `
  ::after {
    content: '';
    height: ${circleSize}px;
    width: ${circleSize}px;
    border-radius: ${circleSize / 2}px;
    display: block;
    position: absolute;
    top: calc(50% - ${circleSize / 2}px);
    left: calc(50% - ${circleSize / 2}px);
  }
  `
      : ""
  }

  ${
    cell.state === CellState.MIDDLE_HL
      ? `
  ::after {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 0;
    left: 0;
    width: 100%;
  }
  `
      : ""
  }

  ${
    cell.state === CellState.LEFT_HL
      ? `
  ::after {
    background-color: rgba(0, 0, 0, 0.2);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    left: 0;
    width: 100%;
  }
  `
      : ""
  }

  ${
    cell.state === CellState.RIGHT_HL
      ? `
  ::after {
    background-color: rgba(0, 0, 0, 0.2);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    left: 0;
    width: 100%;
  }
  `
      : ""
  }
`
);
