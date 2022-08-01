import { Shape } from "svguitar";
import styled from "@emotion/styled";

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

const BaseButton = styled.button<IShapeButtonProps>`
  width: ${(props) =>
    props.length === 1 ? `${props.length * props.circleSize}px` : "100%"};
  height: ${(props) => props.circleSize}px;
  border: none;
  border-radius: ${(props) => props.circleSize / 2}px;
  background-color: ${(props) => props.color};

  :focus {
    outline: none;
  }
`;

const CircleButton = styled(BaseButton)`
  border-radius: ${(props) => props.circleSize / 2}px;
`;
const SquareButton = styled(BaseButton)`
  border-radius: 0;
`;
const TriangleButton = styled(BaseButton)`
  background-color: transparent;
  padding: 0;
  svg {
    position: relative;
    top: 5px;
  }
`;
const PentagonButton = styled(BaseButton)`
  background-color: transparent;
  padding: 0;
  svg {
    position: relative;
  }
`;

const Ngon = (props: IShapeButtonProps & { edges: number }) => (
  <svg height={props.circleSize} width={props.circleSize} viewBox="0 0 100 100">
    <path fill={props.color} d={ngonPath(0, 0, 100, props.edges)} />
  </svg>
);

const Triangle = (props: IShapeButtonProps) => (
  <TriangleButton {...props}>
    <Ngon {...props} edges={3} />
  </TriangleButton>
);
const Pentagon = (props: IShapeButtonProps) => (
  <PentagonButton {...props}>
    <Ngon {...props} edges={5} />
  </PentagonButton>
);

export function ShapeButton(props: IShapeButtonProps) {
  switch (props.shape) {
    case Shape.CIRCLE:
      return <CircleButton {...props} />;
    case Shape.SQUARE:
      return <SquareButton {...props} />;
    case Shape.TRIANGLE:
      return <Triangle {...props} />;
    case Shape.PENTAGON:
      return <Pentagon {...props} />;
    default:
      return <CircleButton {...props} />;
  }
}
