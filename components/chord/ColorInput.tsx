import { Button } from "@chakra-ui/react";
import styled from "@emotion/styled";
import React, { useRef, useState } from "react";
import { ColorResult } from "react-color";
import SketchPicker from "react-color/lib/components/sketch/Sketch";
import { useEscHandler } from "../../hooks/use-esc-handler";
import { useOutsideHandler } from "../../hooks/use-outside-click";

const ColorPickerContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ColorPreview = styled.span<{ color?: string }>`
  width: 1em;
  height: 1em;
  border: 2px solid #ced4da;
  border-radius: 5px;
  margin-right: 10px;
  display: inline-block;
  background-color: ${(props) => props.color || "000#"};
`;

const ColorPreviewButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ClickWrapper = styled.div`
  position: absolute;
  top: 60px;
  z-index: 10;
`;

interface Props {
  onChange: (color: string) => void;
  value?: string;
  render?: (props: ChildProps) => React.ReactNode;
}

interface ChildProps {
  value?: string;
  onClick: () => void;
}

export const ColorInput = (props: Props) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideHandler(ref, () => setVisible(false));
  useEscHandler(() => setVisible(false));

  const onColorChange = ({ rgb }: ColorResult) => {
    const rgba = rgb.a
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    props.onChange(rgba);
  };

  return (
    <ColorPickerContainer>
      {props.render ? (
        props.render({
          value: props.value,
          onClick: () => setVisible(!visible),
        })
      ) : (
        <ColorPreviewButton
          variant="outline-dark"
          onClick={() => setVisible(!visible)}
        >
          <ColorPreview color={props.value} />
          Select Color...
        </ColorPreviewButton>
      )}

      {visible && (
        <ClickWrapper ref={ref}>
          <SketchPicker color={props.value} onChangeComplete={onColorChange} />
        </ClickWrapper>
      )}
    </ColorPickerContainer>
  );
};
