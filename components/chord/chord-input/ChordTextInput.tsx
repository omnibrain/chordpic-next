import * as React from "react";
import { FormEvent } from "react";
import { ClickCellContainer } from "./ClickCellContainer";
import { IChordInputSettings } from "../ChordEditor";
import { ChordMatrix } from "../../../services/chord-matrix";
import { EditMode } from "../../../domain/edit-mode";

export interface IChordTextInputProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  editMode: EditMode;
  onMatrixChange: (matrix: ChordMatrix) => void;
  onEditModeChange: (editMode: EditMode) => void;
}

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
            <div
              key={`${fretIndex}-${sectionIndex}`}
              className="relative flex flex-col items-center justify-center"
              style={{ gridColumn: `span ${length}` }}
              onClick={
                empty
                  ? () => props.onEditModeChange(EditMode.EDIT_NOTES)
                  : void 0
              }
            >
              {!empty && props.editMode === EditMode.EDIT_TEXT && (
                <input
                  type="text"
                  className="h-2/5 w-full rounded-[3px] border-2 border-[color:var(--fg)] bg-background p-0 text-center text-base leading-normal text-foreground"
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
                <span className="absolute text-[#b3b3b3]">
                  {matrix.get(fretIndex, stringIndex).text ?? ""}
                </span>
              )}
            </div>
          ))
      )}
    </ClickCellContainer>
  );
};
