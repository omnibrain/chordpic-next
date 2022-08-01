import styled from '@emotion/styled'
import { IChordInputSettings } from '../ChordEditor'

export const ClickCellContainer = styled.div<IChordInputSettings & { numFrets: number; numStrings: number; clickThrough?: boolean }>(
  (props) => `
  left: -${props.width / props.numStrings / 2}px;
  position: absolute;
  width: ${props.width}px;
  display: grid;
  grid-template-columns: repeat(${props.numStrings}, 1fr);
  grid-row-gap: ${props.lineWidth}px;
  grid-template-rows: repeat(${props.numFrets}, ${props.height / 4}px);
  padding: ${props.lineWidth}px ${props.lineWidth}px 0 ${props.lineWidth}px;
  pointer-events: ${props.clickThrough ? 'none' : 'all'};
`
)
