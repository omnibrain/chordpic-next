import type { Chord, ChordSettings, Finger, OpenString } from '@svguitar/core'
import { EditableChord } from '../domain/chart'

/*
 * Typed rather than imported, so that this module never loads SVGuitar itself:
 * chord-ssr.ts has to be the first thing to import it on the server, with a
 * window in place.
 */
const OPEN: OpenString = 0

// The frets with an inlay on a real guitar neck; 12 and 24 have two dots.
const inlays = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]

/**
 * SVGuitar counts fret markers from the first drawn fret, so shift the inlays
 * by the starting fret to keep them on the same frets as on a real neck.
 */
export function fretMarkersFrom(position = 1): NonNullable<ChordSettings['fretMarkers']> {
  return inlays
    .filter((fret) => fret >= position)
    .map((fret) => (fret % 12 === 0 ? { fret: fret - position, double: true } : fret - position))
}

/**
 * The SVGuitar configuration behind every diagram, in the browser and on the server.
 *
 * Both have to agree: the server draws the diagram a shared link shows, and the
 * browser redraws it once a Pro visitor turns out to need no watermark.
 */
export function toSvguitarSettings(
  settings: Partial<ChordSettings>,
  watermark: string
): Partial<ChordSettings> {
  return {
    fretSize: 1.75,
    barreChordRadius: 0.5,
    ...settings,
    fretMarkers: fretMarkersFrom(settings.position),
    svgTitle: 'Chord diagram created with chordpic.com',
    watermark,
    watermarkFontSize: 16,
    watermarkColor: 'rgba(0, 0, 0, 0.5)'
  }
}

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
