import * as React from "react";
import { ClickCellContainer } from "./ClickCellContainer";
import { IChordInputSettings } from "../ChordEditor";
import styled from "@emotion/styled";
import { ShapeButton } from "./ShapeButton";
import { Shape } from "svguitar";
import { ChordMatrix } from "../../../services/chord-matrix";
import { EditMode } from "../../../domain/edit-mode";

export interface IChordTextInputProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  editMode: EditMode;
  onMatrixChange: (matrix: ChordMatrix) => void;
  onEditModeChange: (editMode: EditMode) => void;
  circleSize: number;
}

interface IInputCellProps {
  size: number;
  empty: boolean;
}

const Section = styled.div<IInputCellProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  grid-column: span ${(props) => props.size};
  position: relative;
`;

export const ChordNotes = (props: IChordTextInputProps) => {
  const matrix = props.matrix;

  return (
    <ClickCellContainer
      {...props.settings}
      numFrets={matrix.numFrets}
      numStrings={matrix.numStrings}
      clickThrough={props.editMode !== EditMode.EDIT_SHAPE}
    >
      {matrix.rows.map((_, fretIndex) =>
        matrix
          .getSections(fretIndex)
          .map(({ length, empty, string: stringIndex }, sectionIndex) => (
            <Section
              key={`${fretIndex}-${stringIndex}-${sectionIndex}`}
              size={length}
              empty={empty}
              onClick={
                empty
                  ? () => props.onEditModeChange(EditMode.EDIT_NOTES)
                  : void 0
              }
            >
              {!empty && (
                <ShapeButton
                  shape={
                    props.matrix.get(fretIndex, stringIndex).shape ??
                    Shape.CIRCLE
                  }
                  onClick={() =>
                    props.onMatrixChange(
                      matrix.nextShape(stringIndex, fretIndex)
                    )
                  }
                  circleSize={props.circleSize}
                  length={length}
                  color={
                    matrix.get(fretIndex, stringIndex).color ??
                    "var(--chakra-colors-chakra-body-text)"
                  }
                />
              )}
            </Section>
          ))
      )}
    </ClickCellContainer>
  );
};
