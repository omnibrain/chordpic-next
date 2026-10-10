import { Chord, ChordSettings, FingerOptions, FretLabelFormat } from '@svguitar/core'

export interface HiddenString extends Pick<FingerOptions, 'text' | 'strokeColor' | 'textColor'> {
  // Uses SVGuitar's string numbering (1 through the number of strings).
  string: number
}

export interface EditableChord extends Chord {
  // Hidden markers are omitted from fingers, so keep their editor state separately.
  hiddenStrings?: HiddenString[]
}

// Settings are stored as JSON, so a format function can't be one of them
export type ChartSettings = Partial<Omit<ChordSettings, 'fretLabelFormat'>> & {
  fretLabelFormat?: FretLabelFormat
}

export interface Chart {
  chord: EditableChord
  settings: ChartSettings
}
