import React, { useCallback, useRef, useState } from "react";
import { ColorResult } from "react-color";
import SketchPicker from "react-color/lib/components/sketch/Sketch";
import { useEscHandler } from "../../hooks/use-esc-handler";
import { useOutsideHandler } from "../../hooks/use-outside-click";
import { Button } from "../ui/Button";

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
    const rgba = rgb.a
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
      : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    props.onChange(rgba);
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
            className="inline-block h-4 w-4 rounded border border-zinc-300 dark:border-zinc-600"
            style={{ backgroundColor: props.value || "#000" }}
          />
          Select Color...
        </Button>
      )}

      {visible && (
        <div ref={ref} className="absolute top-[60px] z-10">
          <SketchPicker color={props.value} onChangeComplete={onColorChange} />
        </div>
      )}
    </div>
  );
};
