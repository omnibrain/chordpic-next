import { Chord, Finger, OPEN } from 'svguitar'
import { EditableChord } from '../domain/chart'

/** Add labels for hidden markers without changing their saved editor state. */
export function toSvguitarChord({ hiddenStrings = [], ...chord }: EditableChord): Chord {
  const labels = hiddenStrings
    .filter(({ string, text }) =>
      text &&
      !chord.fingers.some(([fingerString]) => fingerString === string) &&
      !chord.barres.some(({ fromString, toString }) =>
        string >= Math.min(fromString, toString) && string <= Math.max(fromString, toString)
      )
    )
    .map<Finger>(({ string, text, textColor }) => [
      string,
      OPEN,
      {
        text,
        ...(textColor ? { textColor } : {}),
        strokeWidth: 0,
        // The hand-drawn renderer ignores a zero width, so also disable its stroke.
        strokeColor: 'none'
      }
    ])

  return { ...chord, fingers: [...chord.fingers, ...labels] }
}
