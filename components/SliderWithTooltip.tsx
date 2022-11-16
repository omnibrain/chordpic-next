import {
  ComponentWithAs,
  forwardRef,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";

export interface SliderWithTooltipProps {
  min: number;
  max: number;
  step: number;
}

const DISPLAY_SCALE = 100;

export const SliderWithTooltip: ComponentWithAs<
  "div",
  SliderProps & SliderWithTooltipProps
> = forwardRef(({ min, max, step, value, ...field }, ref) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const displayValue = Math.round(
    (DISPLAY_SCALE / (max - min)) * ((value ?? 0) - max) + DISPLAY_SCALE
  );

  return (
    <Slider
      ref={ref}
      aria-label="Chord chart finger size"
      min={min}
      max={max}
      step={step}
      value={value}
      {...field}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        placement="top"
        isOpen={showTooltip}
        label={displayValue}
      >
        <SliderThumb boxSize={6} />
      </Tooltip>
    </Slider>
  );
});
