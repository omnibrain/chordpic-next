import React from "react";
import { ChordMatrix, EmptyStringState } from "../../services/chord-matrix";
import { IChordInputSettings } from "./ChordEditor";
import { EditMode } from "../../domain/edit-mode";
import { ColorInput } from "./ColorInput";

interface IProps {
  settings: IChordInputSettings;
  matrix: ChordMatrix;
  editMode: EditMode;
  onMatrixChange: (newMatrix: ChordMatrix) => void;
  onEditModeChange: (mode: EditMode) => void;
}

const stateClassNames: Partial<Record<EmptyStringState, string>> = {
  [EmptyStringState.X]: "silent",
  [EmptyStringState.O]: "open",
  [EmptyStringState.NONE]: "none",
};

/**
 * Row of toggles above the fretboard to mark strings as open ("O"), silent ("X") or hidden
 * (no marker at all - useful for scale/pattern diagrams). The marks are drawn with
 * pseudo-elements (see .string-cell in globals.css) sized via the --circle-size CSS variable
 * and colored via the --string-color CSS variable.
 *
 * While the global edit mode is "Edit Text"/"Edit Colors", clicking an open or silent marker
 * lets you attach a text label (e.g. a note name or scale degree) or a custom color to it,
 * mirroring how fretted notes are edited elsewhere in the fretboard grid.
 */
export const SilentStringsInput = ({
  matrix,
  settings,
  editMode,
  onMatrixChange,
  onEditModeChange,
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
    {matrix.getEmptyStringCells().map((cell, i) => {
      const editable =
        cell.state === EmptyStringState.O || cell.state === EmptyStringState.X;

      return (
        <div
          key={i}
          className={`string-cell relative ${stateClassNames[cell.state] ?? ""}`}
          style={
            {
              "--circle-size": `${settings.circleSize}px`,
              ...(cell.color ? { "--string-color": cell.color } : {}),
            } as React.CSSProperties
          }
          onClick={() => {
            if (editMode === EditMode.EDIT_NOTES) {
              onMatrixChange(matrix.toggleEmptyState(i));
            } else if (!editable) {
              // clicking a marker that can't be edited in this mode (hidden, or part of a
              // fretted note elsewhere on the string) falls back to note editing, same as
              // clicking an empty section of the fretted grid does
              onEditModeChange(EditMode.EDIT_NOTES);
            }
          }}
          data-cell-index={i}
        >
          {editable && editMode === EditMode.EDIT_TEXT && (
            <input
              type="text"
              className="absolute left-0 top-1/2 z-10 h-2/5 w-full -translate-y-1/2 rounded-[3px] border-2 border-[color:var(--fg)] bg-background p-0 text-center text-base leading-normal text-foreground"
              value={cell.text ?? ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                onMatrixChange(matrix.emptyStringText(i, e.target.value))
              }
            />
          )}
          {editable && cell.text && editMode !== EditMode.EDIT_TEXT && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#b3b3b3]">
              {cell.text}
            </span>
          )}
          {editable && editMode === EditMode.EDIT_COLOR && (
            <ColorInput
              render={(renderProps) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    renderProps.onClick();
                  }}
                  className="absolute inset-0 z-10 h-full w-full border-none bg-transparent outline-none"
                >
                  <span className="sr-only">pick color</span>
                </button>
              )}
              value={cell.color ?? "var(--fg)"}
              onChange={(color) =>
                onMatrixChange(matrix.emptyStringColor(i, color))
              }
            />
          )}
        </div>
      );
    })}
  </div>
);
