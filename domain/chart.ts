import { Chord, ChordSettings, FingerOptions } from 'svguitar'

export interface HiddenString extends Pick<FingerOptions, 'text' | 'strokeColor' | 'textColor'> {
  // Uses SVGuitar's string numbering (1 through the number of strings).
  string: number
}

export interface EditableChord extends Chord {
  // Hidden markers are omitted from fingers, so keep their editor state separately.
  hiddenStrings?: HiddenString[]
}

export interface Chart {
  chord: EditableChord
  settings: Partial<ChordSettings>
}
