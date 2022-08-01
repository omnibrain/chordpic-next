import * as React from "react";
import {
  MutableRefObject,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "@emotion/styled";
import range from "lodash.range";
import { IChordInputSettings } from "../ChordEditor";
import { ClickCellContainer } from "./ClickCellContainer";
import { ChordTextInput } from "./ChordTextInput";
import { ChordColorInput } from "./ChordColorInput";
import { ClickCell } from "./ClickCell";
import { ChordNotes } from "./ChordNotes";
import { EditMode } from "../../../domain/edit-mode";
import { ChordMatrix } from "../../../services/chord-matrix";

interface IProps {
  settings: IChordInputSettings;
  editMode: EditMode;
  matrix: ChordMatrix;
  onMatrixChange: (newMatrix: ChordMatrix) => void;
  onEditModeChange: (mode: EditMode) => void;
}

const StyledChordInput = styled.div<
  IChordInputSettings & { numFrets: number; numStrings: number }
>`
  display: grid;
  margin-left: ${(props) => props.width / props.numStrings / 2}px;
  position: relative;
  width: ${(props) => props.width - props.width / props.numStrings}px;
  grid-template-columns: repeat(${(props) => props.numStrings - 1}, 1fr);
  grid-template-rows: repeat(
    ${(props) => props.numFrets},
    ${(props) => props.height / 4}px
  );
  grid-gap: ${(props) => props.lineWidth}px;
  padding: ${(props) => props.lineWidth}px ${(props) => props.lineWidth}px 0
    ${(props) => props.lineWidth}px;

  background-color: var(--chakra-colors-chakra-body-text);

  .cell {
    background-color: var(--chakra-colors-chakra-body-bg);
  }
`;

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(
  ref: MutableRefObject<HTMLDivElement | null>,
  handler: () => void
) {
  /**
   * Alert if clicked on outside of element
   */
  function handleMouseUpOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      handler();
    }
  }

  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mouseup", handleMouseUpOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handleMouseUpOutside);
    };
  });
}

function getTargetStringIndex(e: TouchEvent<HTMLDivElement>): number | null {
  // hack to find the cell from which the finger was lifted
  const stringIndexDataAttr = "data-string-index";
  const location = e.nativeEvent.changedTouches[0];
  const touchCellDomEl = document.elementFromPoint(
    location.clientX,
    location.clientY
  );
  if (!touchCellDomEl || !touchCellDomEl.hasAttribute(stringIndexDataAttr)) {
    return null;
  }

  return Number(touchCellDomEl.getAttribute(stringIndexDataAttr));
}

export default (props: IProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [startFrom, setStartFrom] = useState<{
    stringIndex: number;
    fretIndex: number;
  } | null>(null);

  useOutsideAlerter(wrapperRef, () => {
    const newMatrix = matrix.connectHighlighted();
    if (matrix !== newMatrix) {
      onMatrixChange(newMatrix);
      setStartFrom(null);
    }
  });

  const onMatrixChange = (newMatrix: ChordMatrix) => {
    // only call props.onMatrixChange if the matrix actually changed
    if (newMatrix !== matrix) {
      props.onMatrixChange(newMatrix);
    }
  };

  const { matrix } = props;

  return (
    <StyledChordInput
      {...props.settings}
      ref={wrapperRef}
      numFrets={matrix.numFrets}
      numStrings={matrix.numStrings}
    >
      {range(matrix.numStrings * matrix.numFrets - 1).map((i) => (
        <div key={i} className="cell" data-cell-index={i} />
      ))}

      <ClickCellContainer
        {...props.settings}
        numFrets={matrix.numFrets}
        numStrings={matrix.numStrings}
      >
        {matrix.rows.map((row, fretIndex) =>
          row.map((cell, stringIndex) => (
            <ClickCell
              circleSize={props.settings.circleSize}
              cell={cell}
              editMode={props.editMode}
              data-string-index={stringIndex}
              data-row-index={fretIndex}
              key={`${fretIndex}-${stringIndex}`}
              onClick={() =>
                onMatrixChange(matrix.toggle(stringIndex, fretIndex))
              }
              onMouseDown={() => setStartFrom({ stringIndex, fretIndex })}
              onMouseEnter={() => {
                if (
                  startFrom &&
                  Math.abs(stringIndex - startFrom.stringIndex) > 0
                ) {
                  onMatrixChange(
                    matrix.connectHighlight(
                      startFrom.fretIndex,
                      startFrom.stringIndex,
                      stringIndex
                    )
                  );
                }
              }}
              onTouchStart={() => setStartFrom({ stringIndex, fretIndex })}
              onTouchMove={(e) => {
                const targetStringIndex = getTargetStringIndex(e);
                if (targetStringIndex === null) {
                  return;
                }

                if (
                  startFrom &&
                  Math.abs(targetStringIndex - startFrom.stringIndex) > 0
                ) {
                  onMatrixChange(
                    matrix.connectHighlight(
                      startFrom.fretIndex,
                      startFrom.stringIndex,
                      targetStringIndex
                    )
                  );
                }
              }}
              onMouseUp={() => {
                onMatrixChange(matrix.connectHighlighted());
                setStartFrom(null);
              }}
              onTouchEnd={() => {
                onMatrixChange(matrix.connectHighlighted());
                setStartFrom(null);
              }}
            />
          ))
        )}
      </ClickCellContainer>

      <ChordNotes
        circleSize={props.settings.circleSize}
        settings={props.settings}
        matrix={matrix}
        editMode={props.editMode}
        onMatrixChange={props.onMatrixChange}
        onEditModeChange={props.onEditModeChange}
      />

      <ChordTextInput
        settings={props.settings}
        matrix={matrix}
        editMode={props.editMode}
        onMatrixChange={props.onMatrixChange}
        onEditModeChange={props.onEditModeChange}
      />
      <ChordColorInput
        settings={props.settings}
        matrix={matrix}
        editMode={props.editMode}
        onMatrixChange={props.onMatrixChange}
        onEditModeChange={props.onEditModeChange}
      />
    </StyledChordInput>
  );
};
