import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ColorResult } from "react-color";
import { T } from "@magic-translate/react";
import { useOutsideHandler } from "../hooks/use-outside-click";
import { useEscHandler } from "../hooks/use-esc-handler";
import { Button } from "@/components/ui/button";

// react-color pulls in all of lodash; load it when a picker is first wanted.
const loadSketchPicker = () =>
  import("react-color/lib/components/sketch/Sketch");
const SketchPicker = dynamic(loadSketchPicker, { ssr: false });

interface Props {
  onChange: (color: string) => void;
  value?: string;
  render?: (props: ChildProps) => React.ReactNode;
  /** Where the picker pops up relative to the trigger. Defaults to "down". */
  direction?: "up" | "down";
}

interface ChildProps {
  value?: string;
  onClick: () => void;
}

export const ColorInput = ({ direction = "down", ...props }: Props) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideHandler(ref, () => setVisible(false));

  const escHandler = useCallback(() => setVisible(false), []);
  useEscHandler(escHandler);

  const onColorChange = ({ rgb }: ColorResult) => {
    const color =
      typeof rgb.a === "number" && rgb.a < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    props.onChange(color);
  };

  return (
    <div
      className="relative flex flex-1 flex-col items-center justify-center"
      onPointerEnter={loadSketchPicker}
      onFocus={loadSketchPicker}
    >
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
        <div
          ref={ref}
          className={`absolute z-10 ${
            direction === "up" ? "bottom-[60px]" : "top-[60px]"
          }`}
        >
          <SketchPicker color={props.value} onChangeComplete={onColorChange} />
        </div>
      )}
    </div>
  );
};
