import * as React from "react";
import { ClickCellContainer } from "./ClickCellContainer";
import { IChordInputSettings } from "../ChordEditor";
import { ShapeButton } from "./ShapeButton";
import { BarreButton } from "./BarreButton";
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

export const ChordNotes = (props: IChordTextInputProps) => {
  const matrix = props.matrix;
  const stringSpacing = props.settings.width / matrix.numStrings;

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
            <div
              key={`${fretIndex}-${stringIndex}-${sectionIndex}`}
              className="relative flex flex-col items-center justify-center"
              style={{ gridColumn: `span ${length}` }}
              onClick={
                empty
                  ? () => props.onEditModeChange(EditMode.EDIT_NOTES)
                  : void 0
              }
            >
              {!empty &&
                (matrix.isBarre(fretIndex, stringIndex) ? (
                  <BarreButton
                    arc={matrix.isArcBarre(fretIndex, stringIndex)}
                    width={stringSpacing * length}
                    stringSpacing={stringSpacing}
                    circleSize={props.circleSize}
                    color={
                      matrix.get(fretIndex, stringIndex).color ?? "var(--fg)"
                    }
                    onClick={() =>
                      props.onMatrixChange(
                        matrix.toggleBarreStyle(stringIndex, fretIndex)
                      )
                    }
                  />
                ) : (
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
                    color={
                      matrix.get(fretIndex, stringIndex).color ?? "var(--fg)"
                    }
                  />
                ))}
            </div>
          ))
      )}
    </ClickCellContainer>
  );
};
