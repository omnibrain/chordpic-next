import React, { forwardRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  HTMLSpanElement,
  SliderWithTooltipProps
>(({ min, max, step, value, onChange, onBlur, name, ...rest }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const displayValue = Math.round(
    (DISPLAY_SCALE / (max - min)) * ((value ?? 0) - max) + DISPLAY_SCALE,
  );

  return (
    <Tooltip open={showTooltip}>
      <TooltipTrigger asChild>
        <div
          className="flex h-9 w-full items-center"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Slider
            ref={ref}
            name={name}
            aria-label={rest["aria-label"]}
            min={min}
            max={max}
            step={step}
            value={[value ?? min]}
            onValueChange={(values) => onChange?.(values[0])}
            onBlur={onBlur}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>{displayValue}</TooltipContent>
    </Tooltip>
  );
});

SliderWithTooltip.displayName = "SliderWithTooltip";
