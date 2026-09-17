import React from "react";

export interface IBarreButtonProps {
  arc: boolean;
  width: number;
  stringSpacing: number;
  circleSize: number;
  color: string;
  onClick: () => void;
}

/**
 * The same two quadratic curves SVGuitar draws an arc barre chord with, so the
 * editor previews the shape the diagram will end up with.
 */
function arcPath(x: number, y: number, width: number, height: number): string {
  const thickness = 0.35;
  const bottom = y + height;

  return [
    `M ${x} ${bottom}`,
    `Q ${x + width / 2} ${y - height} ${x + width} ${bottom}`,
    `Q ${x + width / 2} ${
      bottom - height * 2 * (1 - thickness)
    } ${x} ${bottom}`,
    "Z",
  ].join(" ");
}

/**
 * A barre chord in the editor, drawn either as a bar across the fret or as an
 * arc above it. Both fill the whole barre, so switching to the arc doesn't make
 * it any harder to hit.
 */
export function BarreButton(props: IBarreButtonProps) {
  const { arc, width, stringSpacing, circleSize, color, onClick } = props;
  // SVGuitar's arc spans the strings themselves, not the cells around them.
  const height = circleSize / 1.5;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: circleSize,
        border: "none",
        outline: "none",
        padding: 0,
        backgroundColor: arc ? "transparent" : color,
        borderRadius: arc ? 0 : circleSize / 2,
      }}
    >
      {arc && (
        <svg
          width="100%"
          height={circleSize}
          viewBox={`0 0 ${width} ${circleSize}`}
          preserveAspectRatio="none"
        >
          <path
            style={{ fill: color }}
            d={arcPath(
              stringSpacing / 2,
              (circleSize - height) / 2,
              width - stringSpacing,
              height
            )}
          />
        </svg>
      )}
    </button>
  );
}
