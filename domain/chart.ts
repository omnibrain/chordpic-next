import { Chord, ChordSettings } from 'svguitar'

export interface Chart {
  chord: Chord
  settings: Partial<ChordSettings>
}
