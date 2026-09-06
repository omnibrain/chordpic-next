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
 * A second, transparent grid is layered on top for editing: while the global edit mode is
 * "Edit Text"/"Edit Colors", it captures clicks so you can attach a text label (note name,
 * scale degree, ...) to any empty string, or a custom color to an open/silent marker, using the same text
 * input / color picker as the fretted notes (see ChordTextInput / ChordColorInput). It lives
 * outside the .string-cell's `overflow: hidden` so the color picker popover isn't clipped.
 */
export const SilentStringsInput = ({
  matrix,
  settings,
  editMode,
  onMatrixChange,
  onEditModeChange,
}: IProps) => {
  const cells = matrix.getEmptyStringCells();

  const gridStyle: React.CSSProperties = {
    display: "grid",
    width: settings.width,
    gridTemplateColumns: `repeat(${matrix.numStrings}, 1fr)`,
    gridRowGap: settings.lineWidth,
    gridTemplateRows: `${settings.height / 4}px`,
  };

  const editingText = editMode === EditMode.EDIT_TEXT;
  const editingColor = editMode === EditMode.EDIT_COLOR;

  return (
    <div className="relative" style={{ width: settings.width }}>
      {/* base layer: the O / X / hidden markers, click to cycle through them */}
      <div style={gridStyle}>
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`string-cell ${stateClassNames[cell.state] ?? ""}`}
            style={
              {
                "--circle-size": `${settings.circleSize}px`,
                ...(cell.color ? { "--string-color": cell.color } : {}),
              } as React.CSSProperties
            }
            onClick={
              editMode === EditMode.EDIT_NOTES
                ? () => onMatrixChange(matrix.toggleEmptyState(i))
                : undefined
            }
            data-cell-index={i}
          />
        ))}
      </div>

      {/* overlay layer: text label + text/color editing, mirrors ChordTextInput/ChordColorInput.
          Only captures pointer events while actually editing so it doesn't block the toggle. */}
      <div
        style={{
          ...gridStyle,
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 20,
          pointerEvents: editingText || editingColor ? "all" : "none",
        }}
      >
        {cells.map((cell, i) => {
          const hasMarker =
            cell.state === EmptyStringState.O ||
            cell.state === EmptyStringState.X;
          const canEditText = hasMarker || cell.state === EmptyStringState.NONE;

          return (
            <div
              key={i}
              className="relative flex items-stretch justify-center"
              onClick={
                (editingText && !canEditText) || (editingColor && !hasMarker)
                  ? () => onEditModeChange(EditMode.EDIT_NOTES)
                  : undefined
              }
            >
              {canEditText && editingText && (
                <input
                  type="text"
                  className="h-2/5 w-full self-center rounded-[3px] border-2 border-[color:var(--fg)] bg-background p-0 text-center text-base leading-normal text-foreground"
                  value={cell.text ?? ""}
                  onChange={(e) =>
                    onMatrixChange(matrix.emptyStringText(i, e.target.value))
                  }
                />
              )}
              {canEditText && !editingText && cell.text && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#b3b3b3]">
                  {cell.text}
                </span>
              )}
              {hasMarker && editingColor && (
                <ColorInput
                  render={(renderProps) => (
                    <button
                      type="button"
                      onClick={renderProps.onClick}
                      className="h-full w-full border-none bg-transparent outline-none"
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
    </div>
  );
};
