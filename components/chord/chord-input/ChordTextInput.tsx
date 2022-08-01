import * as React from "react";
import { FormEvent } from "react";
import { ClickCellContainer } from "./ClickCellContainer";
import { IChordInputSettings } from "../ChordEditor";
import styled from "@emotion/styled";
import { ChordMatrix } from "../../../services/chord-matrix";
import { EditMode } from "../../../domain/edit-mode";

export interface IChordTextInputProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  editMode: EditMode;
  onMatrixChange: (matrix: ChordMatrix) => void;
  onEditModeChange: (editMode: EditMode) => void;
}

interface IInputCellProps {
  size: number;
}

const InputCell = styled.div<IInputCellProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  grid-column: span ${(props) => props.size};
  position: relative;
`;

const StyledInput = styled.input`
  height: 40%;
  width: 100%;
  border: 2px solid var(--chakra-colors-chakra-body-text);
  border-radius: 3px;
  padding: 0;
  text-align: center;
  font-size: 1em;

  line-height: normal;
`;

const StyledTextSpan = styled.span`
  position: absolute;
  color: #b3b3b3;
`;

export const ChordTextInput = (props: IChordTextInputProps) => {
  const matrix = props.matrix;

  return (
    <ClickCellContainer
      {...props.settings}
      numFrets={matrix.numFrets}
      numStrings={matrix.numStrings}
      clickThrough={props.editMode !== EditMode.EDIT_TEXT}
    >
      {matrix.rows.map((_, fretIndex) =>
        matrix
          .getSections(fretIndex)
          .map(({ length, empty, string: stringIndex }, sectionIndex) => (
            <InputCell
              key={`${fretIndex}-${sectionIndex}`}
              size={length}
              onClick={
                empty
                  ? () => props.onEditModeChange(EditMode.EDIT_NOTES)
                  : void 0
              }
            >
              {!empty && props.editMode === EditMode.EDIT_TEXT && (
                <StyledInput
                  type="text"
                  value={matrix.get(fretIndex, stringIndex).text ?? ""}
                  onChange={(e: FormEvent<HTMLInputElement>) =>
                    props.onMatrixChange(
                      matrix.text(
                        stringIndex,
                        fretIndex,
                        (e.target as HTMLInputElement).value
                      )
                    )
                  }
                />
              )}
              {!empty && props.editMode !== EditMode.EDIT_TEXT && (
                <StyledTextSpan>
                  {matrix.get(fretIndex, stringIndex).text ?? ""}
                </StyledTextSpan>
              )}
            </InputCell>
          ))
      )}
    </ClickCellContainer>
  );
};
