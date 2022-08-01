import styled from "@emotion/styled";
import * as React from "react";
import { IChordInputSettings } from "./ChordEditor";

interface IProps {
  settings: IChordInputSettings;
  tunings: string[];
  numStrings: number;
  onTunings: (tunings: string[]) => void;
}

const StyledTuningInput = styled.div<
  IChordInputSettings & { numStrings: number }
>(
  (props) => `
  position: relative;
  width: ${props.width}px;
  display: grid;
  grid-template-columns: repeat(${props.numStrings}, 1fr);
  grid-row-gap: ${props.lineWidth}px;
  height: ${props.height / 4}px;
  padding: ${props.lineWidth}px ${props.lineWidth}px 0 ${props.lineWidth}px;

  .string-input {
    position: relative;
    padding: 1px;
  }

  input {
    width: 100%;
    text-align: center;
    font-size: 2rem;
    margin-top: 0.5rem;
  }
`
);

const ScreenReaderLabel = styled.label`
  position: absolute !important; /* Outside the DOM flow */
  height: 1px;
  width: 1px; /* Nearly collapsed */
  overflow: hidden;
  clip: rect(1px 1px 1px 1px); /* IE 7+ only support clip without commas */
  clip: rect(1px, 1px, 1px, 1px); /* All other browsers */
`;

const Input = styled.input`
  border: 2px solid var(--chakra-colors-chakra-body-text);
  border-radius: 3px;
  padding: 0;
`;

export const TuningInput = (props: IProps) => (
  <StyledTuningInput {...props.settings} numStrings={props.numStrings}>
    {props.tunings.map((tuning, i) => {
      const stringLabel = Math.abs(i - props.numStrings);

      return (
        <div key={i} className="string-input" data-cell-index={i}>
          <ScreenReaderLabel htmlFor={`tuning-input-string-${i}`}>
            Tuning of String {stringLabel}
          </ScreenReaderLabel>
          <Input
            id={`tuning-input-string-${i}`}
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
  </StyledTuningInput>
);
