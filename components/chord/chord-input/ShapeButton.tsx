import React from "react";
import { Shape } from "svguitar";

function ngonPath(x: number, y: number, size: number, edges: number): string {
  let i: number;
  let a: number;
  const degrees = 360 / edges;
  const radius = size / 2;
  const points: [number, number][] = [];

  let curX = x;
  let curY = y;

  for (i = 0; i < edges; i += 1) {
    a = i * degrees - 90;

    curX = radius + radius * Math.cos((a * Math.PI) / 180);
    curY = radius + radius * Math.sin((a * Math.PI) / 180);

    points.push([curX, curY]);
  }

  const lines = points.reduce(
    (acc, [posX, posY]) => `${acc} L${posX} ${posY}`,
    ""
  );

  return `M${curX} ${curY} ${lines}`;
}

export interface IShapeButtonProps {
  length: number;
  circleSize: number;
  color: string;
  shape: Shape;
  onClick: () => void;
}

const baseStyle = (props: IShapeButtonProps): React.CSSProperties => ({
  width: props.length === 1 ? props.length * props.circleSize : "100%",
  height: props.circleSize,
  border: "none",
  outline: "none",
  backgroundColor: props.color,
});

const Ngon = (props: IShapeButtonProps & { edges: number }) => (
  <svg height={props.circleSize} width={props.circleSize} viewBox="0 0 100 100">
    <path fill={props.color} d={ngonPath(0, 0, 100, props.edges)} />
  </svg>
);

export function ShapeButton(props: IShapeButtonProps) {
  const { shape, onClick } = props;

  switch (shape) {
    case Shape.SQUARE:
      return (
        <button
          onClick={onClick}
          style={{ ...baseStyle(props), borderRadius: 0 }}
        />
      );
    case Shape.TRIANGLE:
      return (
        <button
          onClick={onClick}
          style={{
            ...baseStyle(props),
            backgroundColor: "transparent",
            padding: 0,
          }}
        >
          <span className="relative top-[5px] inline-block">
            <Ngon {...props} edges={3} />
          </span>
        </button>
      );
    case Shape.PENTAGON:
      return (
        <button
          onClick={onClick}
          style={{
            ...baseStyle(props),
            backgroundColor: "transparent",
            padding: 0,
          }}
        >
          <Ngon {...props} edges={5} />
        </button>
      );
    case Shape.CIRCLE:
    default:
      return (
        <button
          onClick={onClick}
          style={{
            ...baseStyle(props),
            borderRadius: props.circleSize / 2,
          }}
        />
      );
  }
}
