import * as React from "react";
import { IChordInputSettings } from "./ChordEditor";

interface IProps {
  settings: IChordInputSettings;
  tunings: string[];
  numStrings: number;
  onTunings: (tunings: string[]) => void;
}

export const TuningInput = (props: IProps) => (
  <div
    style={{
      position: "relative",
      width: props.settings.width,
      display: "grid",
      gridTemplateColumns: `repeat(${props.numStrings}, 1fr)`,
      gridRowGap: props.settings.lineWidth,
      height: props.settings.height / 4,
      padding: `${props.settings.lineWidth}px ${props.settings.lineWidth}px 0 ${props.settings.lineWidth}px`,
    }}
  >
    {props.tunings.map((tuning, i) => {
      const stringLabel = Math.abs(i - props.numStrings);

      return (
        <div key={i} className="relative p-px" data-cell-index={i}>
          <label htmlFor={`tuning-input-string-${i}`} className="sr-only">
            Tuning of String {stringLabel}
          </label>
          <input
            id={`tuning-input-string-${i}`}
            className="mt-2 w-full rounded-[3px] border-2 border-[color:var(--fg)] bg-white p-0 text-center text-3xl text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder={String(stringLabel)}
            type="text"
            value={tuning}
            onChange={(e) =>
              props.onTunings(
                props.tunings.map((val, j) => (i === j ? e.target.value : val))
              )
            }
          />
        </div>
      );
    })}
  </div>
);
