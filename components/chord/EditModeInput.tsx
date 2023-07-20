import { Button, SimpleGrid } from "@chakra-ui/react";
import { T } from "@magic-translate/react";
import * as React from "react";
import { EditMode } from "../../domain/edit-mode";

interface IProps {
  onEditModeChange: (mode: EditMode) => void;
  editMode: EditMode;
}

export const EditModeInput = ({ onEditModeChange, editMode }: IProps) => {
  const onChange = (mode: EditMode) => () => onEditModeChange(mode);

  return (
    <SimpleGrid gridTemplateColumns="1fr 1fr" gap={2}>
      <Button
        onClick={onChange(EditMode.EDIT_NOTES)}
        variant={editMode === EditMode.EDIT_NOTES ? "solid" : "outline"}
        size="sm"
      >
        <T>Edit Fingers</T>
      </Button>
      <Button
        onClick={onChange(EditMode.EDIT_TEXT)}
        variant={editMode === EditMode.EDIT_TEXT ? "solid" : "outline"}
        size="sm"
      >
        <T>Edit Text</T>
      </Button>
      <Button
        onClick={onChange(EditMode.EDIT_COLOR)}
        variant={editMode === EditMode.EDIT_COLOR ? "solid" : "outline"}
        size="sm"
      >
        <T>Edit Colors</T>
      </Button>
      <Button
        onClick={onChange(EditMode.EDIT_SHAPE)}
        variant={editMode === EditMode.EDIT_SHAPE ? "solid" : "outline"}
        size="sm"
      >
        <T>Edit Shapes</T>
      </Button>
    </SimpleGrid>
  );
};
