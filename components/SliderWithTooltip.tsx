import React, { forwardRef, useState } from "react";
import { Tooltip } from "./ui/Tooltip";

export interface SliderWithTooltipProps {
  min: number;
  max: number;
  step: number;
  value?: number;
  name?: string;
  "aria-label"?: string;
  onChange?: (value: number) => void;
  onBlur?: () => void;
}

const DISPLAY_SCALE = 100;

export const SliderWithTooltip = forwardRef<
  HTMLInputElement,
  SliderWithTooltipProps
>(({ min, max, step, value, onChange, onBlur, name, ...rest }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const displayValue = Math.round(
    (DISPLAY_SCALE / (max - min)) * ((value ?? 0) - max) + DISPLAY_SCALE,
  );

  return (
    <Tooltip label={displayValue} isOpen={showTooltip} className="w-full">
      <span
        className="flex h-10 w-full items-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <input
          ref={ref}
          type="range"
          className="slider"
          name={name}
          aria-label={rest["aria-label"]}
          min={min}
          max={max}
          step={step}
          value={value ?? 0}
          onChange={(e) => onChange?.(e.target.valueAsNumber)}
          onBlur={onBlur}
        />
      </span>
    </Tooltip>
  );
});

SliderWithTooltip.displayName = "SliderWithTooltip";
