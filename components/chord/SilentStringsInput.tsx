import * as React from "react";
import styled from "@emotion/styled";
import { IChordInputSettings } from "./ChordEditor";
import { ChordMatrix, EmptyStringState } from "../../services/chord-matrix";
import { Box, Flex } from "@chakra-ui/react";

interface IProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  onMatrixChange: (newMatrix: ChordMatrix) => void;
}

const StyledSilentStringsInput = styled.div<
  IChordInputSettings & { numStrings: number }
>(
  (settings) => `
  display: grid;
  width: ${settings.width}px;
  grid-template-columns: repeat(${settings.numStrings}, 1fr);
  grid-row-gap: ${settings.lineWidth}px;
  grid-template-rows: ${settings.height / 4}px;

  .cell {
    position: relative;
    background-color: Transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
    outline: none;
  }

  .cell::before {
    height: ${settings.circleSize}px;
    width: ${settings.circleSize}px;
    display: block;
    position: absolute;
    top: calc(50% - ${settings.circleSize / 2}px);
    left: calc(50% - ${settings.circleSize / 2}px);
  }

  .cell.open::before {
    content: '';
    border-radius: ${settings.circleSize / 2}px;
    border: 3px solid var(--chakra-colors-chakra-body-text);
  }

  .cell.silent {
    // background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'%3E%3Cpath stroke='black' stroke-width='1' d='M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z'/%3E%3C/svg%3E%0A");
    background-size: ${settings.circleSize}px ${settings.circleSize}px;
    background-position: center;
  }

  .cell.silent:before, .cell.silent:after {
    position: absolute;
    left: ${settings.circleSize / 2}px;
    top: 8px;
    content: ' ';
    height: ${settings.circleSize * 1.25}px;
    width: 3px;
    background-color: var(--chakra-colors-chakra-body-text);
  }
  .cell.silent:before {
    transform: rotate(45deg);
  }
  .cell.silent:after {
    transform: rotate(-45deg);
  }
  
`
);

export default ({ matrix, settings, onMatrixChange }: IProps) => (
  <StyledSilentStringsInput {...settings} numStrings={matrix.numStrings}>
    {matrix.getEmptyStringStates().map((state, i) => (
      <div
        key={i}
        className={`cell ${
          state !== EmptyStringState.NOT_EMPTY
            ? state === EmptyStringState.X
              ? "silent"
              : "open"
            : ""
        }`}
        onClick={() => onMatrixChange(matrix.toggleEmptyState(i))}
        data-cell-index={i}
      />
    ))}
  </StyledSilentStringsInput>
);
