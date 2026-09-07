import React, { useCallback, useRef, useState } from "react";
import { ColorResult } from "react-color";
import SketchPicker from "react-color/lib/components/sketch/Sketch";
import { T } from "@magic-translate/react";
import { useOutsideHandler } from "../hooks/use-outside-click";
import { useEscHandler } from "../hooks/use-esc-handler";
import { Button } from "@/components/ui/button";

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
  const escHandler = useCallback(() => setVisible(false), []);
  useEscHandler(escHandler);

  const onColorChange = ({ rgb }: ColorResult) => {
    // rgb.a is 0..1. Only emit rgba() when there is actual transparency - the old
    // `rgb.a ? ... : ...` check treated a fully transparent color (a === 0) as
    // falsy and emitted an opaque rgb() instead.
    const color =
      typeof rgb.a === "number" && rgb.a < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    props.onChange(color);
  };

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center">
      {props.render ? (
        props.render({
          value: props.value,
          onClick: () => setVisible(!visible),
        })
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setVisible(!visible)}
        >
          <span
            className="inline-block h-4 w-4 rounded-sm border"
            style={{ backgroundColor: props.value || "#000" }}
          />
          <T>Select color...</T>
        </Button>
      )}

      {visible && (
        <div ref={ref} className="absolute bottom-[60px] z-10">
          <SketchPicker color={props.value} onChangeComplete={onColorChange} />
        </div>
      )}
    </div>
  );
};
