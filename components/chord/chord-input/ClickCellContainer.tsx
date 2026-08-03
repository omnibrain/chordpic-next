import React, { PropsWithChildren } from "react";
import { IChordInputSettings } from "../ChordEditor";

type Props = IChordInputSettings & {
  numFrets: number;
  numStrings: number;
  clickThrough?: boolean;
};

export const ClickCellContainer: React.FunctionComponent<
  PropsWithChildren<Props>
> = ({ children, ...props }) => (
  <div
    style={{
      left: -(props.width / props.numStrings / 2),
      position: "absolute",
      width: props.width,
      display: "grid",
      gridTemplateColumns: `repeat(${props.numStrings}, 1fr)`,
      gridRowGap: props.lineWidth,
      gridTemplateRows: `repeat(${props.numFrets}, ${props.height / 4}px)`,
      padding: `${props.lineWidth}px ${props.lineWidth}px 0 ${props.lineWidth}px`,
      pointerEvents: props.clickThrough ? "none" : "all",
    }}
  >
    {children}
  </div>
);
