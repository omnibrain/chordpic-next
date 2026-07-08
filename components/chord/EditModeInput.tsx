import { T } from "@magic-translate/react";
import * as React from "react";
import { EditMode } from "../../domain/edit-mode";
import { Button } from "../ui/Button";

interface IProps {
  onEditModeChange: (mode: EditMode) => void;
  editMode: EditMode;
}

const modes: { mode: EditMode; label: string }[] = [
  { mode: EditMode.EDIT_NOTES, label: "Edit Fingers" },
  { mode: EditMode.EDIT_TEXT, label: "Edit Text" },
  { mode: EditMode.EDIT_COLOR, label: "Edit Colors" },
  { mode: EditMode.EDIT_SHAPE, label: "Edit Shapes" },
];

export const EditModeInput = ({ onEditModeChange, editMode }: IProps) => (
  <div className="grid grid-cols-2 gap-2">
    {modes.map(({ mode, label }) => (
      <Button
        key={mode}
        type="button"
        size="sm"
        variant={editMode === mode ? "solid" : "outline"}
        onClick={() => onEditModeChange(mode)}
      >
        <T>{label}</T>
      </Button>
    ))}
  </div>
);
