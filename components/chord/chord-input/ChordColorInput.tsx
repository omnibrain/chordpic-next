import { EditMode } from "../../../domain/edit-mode";
import { ChordMatrix } from "../../../services/chord-matrix";
import { IChordInputSettings } from "../ChordEditor";
import { ColorInput } from "../../ColorInput";
import { ClickCellContainer } from "./ClickCellContainer";

export interface IChordTextInputProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  editMode: EditMode;
  onMatrixChange: (matrix: ChordMatrix) => void;
  onEditModeChange: (editMode: EditMode) => void;
}

export const ChordColorInput = (props: IChordTextInputProps) => {
  const matrix = props.matrix;

  return (
    <ClickCellContainer
      {...props.settings}
      numFrets={matrix.numFrets}
      numStrings={matrix.numStrings}
      clickThrough={props.editMode !== EditMode.EDIT_COLOR}
    >
      {matrix.rows.map((_, fretIndex) =>
        matrix
          .getSections(fretIndex)
          .map(({ length, empty, string: stringIndex }, sectionIndex) => (
            <div
              key={`${fretIndex}-${sectionIndex}`}
              className="relative flex flex-row items-stretch justify-stretch"
              style={{ gridColumn: `span ${length}` }}
              onClick={
                empty
                  ? () => props.onEditModeChange(EditMode.EDIT_NOTES)
                  : void 0
              }
            >
              {!empty && props.editMode === EditMode.EDIT_COLOR && (
                <ColorInput
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      className="h-full w-full border-none bg-transparent outline-none"
                    >
                      <span className="sr-only">pick color</span>
                    </button>
                  )}
                  value={matrix.get(fretIndex, stringIndex).color ?? "var(--fg)"}
                  onChange={(color) => {
                    props.onMatrixChange(
                      matrix.color(stringIndex, fretIndex, color)
                    );
                  }}
                />
              )}
            </div>
          ))
      )}
    </ClickCellContainer>
  );
};
