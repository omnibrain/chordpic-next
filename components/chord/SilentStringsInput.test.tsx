import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SilentStringsInput } from "./SilentStringsInput";
import { ChordMatrix, EmptyStringState } from "../../services/chord-matrix";
import { EditMode } from "../../domain/edit-mode";

// Color picking is independent of editing a hidden marker's text.
jest.mock("../ColorInput", () => ({ ColorInput: () => null }));

it("edits and previews a dotted circle's text without making the marker visible", () => {
  const matrix = new ChordMatrix(3, 3);
  matrix.toggleEmptyState(0).toggleEmptyState(0);
  matrix.toggle(2, 0);
  const onMatrixChange = jest.fn();
  const onEditModeChange = jest.fn();
  const props = {
    matrix,
    settings: { width: 300, height: 300, circleSize: 50, lineWidth: 3 },
    editMode: EditMode.EDIT_TEXT,
    onMatrixChange,
    onEditModeChange,
  };
  const { container, rerender } = render(<SilentStringsInput {...props} />);

  // The hidden and open strings both accept labels; the fretted string does not.
  const inputs = screen.getAllByRole("textbox");
  expect(inputs).toHaveLength(2);
  fireEvent.click(inputs[0]);
  fireEvent.change(inputs[0], { target: { value: "R" } });

  expect(onEditModeChange).not.toHaveBeenCalled();
  expect(onMatrixChange).toHaveBeenCalledTimes(1);
  const updated = onMatrixChange.mock.calls[0][0] as ChordMatrix;
  expect(updated.getEmptyStringCells()[0]).toEqual({
    state: EmptyStringState.NONE,
    text: "R",
  });

  const restored = ChordMatrix.fromChart({
    chord: JSON.parse(JSON.stringify(updated.toVexchord())),
    settings: { strings: 3, frets: 3 },
  });
  rerender(<SilentStringsInput {...props} matrix={restored} editMode={EditMode.EDIT_NOTES} />);
  expect(screen.getByText("R")).toBeTruthy();
  expect(container.querySelector(".string-cell.none")).not.toBeNull();

  rerender(<SilentStringsInput {...props} matrix={restored} />);
  expect((screen.getAllByRole("textbox")[0] as HTMLInputElement).value).toBe("R");
  fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "" } });
  const cleared = onMatrixChange.mock.calls[1][0] as ChordMatrix;
  rerender(<SilentStringsInput {...props} matrix={cleared} editMode={EditMode.EDIT_NOTES} />);
  expect(screen.queryByText("R")).toBeNull();
  expect(container.querySelector(".string-cell.none")).not.toBeNull();
});
