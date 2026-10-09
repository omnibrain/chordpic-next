import {
  chordVoicings,
  getGuitarChord,
  getUkuleleChord,
  searchChords,
  type Instrument
} from '@svguitar/chords-plugin'
import type { Barre, Chord, Finger } from '@svguitar/core'
import type { Chart, ChartSettings } from '../domain/chart'

export type { Instrument }

export interface ChordSearchResult {
  name: string
  instrument: Instrument
  voicing: number
  chord: Chord
}

const strings: Record<Instrument, number> = { guitar: 6, ukulele: 4 }

function getChord(name: string, voicing: number, instrument: Instrument): Chord {
  return instrument === 'ukulele' ? getUkuleleChord(name, voicing) : getGuitarChord(name, voicing)
}

/**
 * Every voicing of the chord the search names, e.g. "am7" or "CM7", and nothing while it doesn't
 * name a chord.
 */
export function findChords(query: string, instrument: Instrument): ChordSearchResult[] {
  const search = query.trim().replace(/^[a-g]/, (root) => root.toUpperCase())
  let voicings: number
  try {
    voicings = chordVoicings(search, instrument)
  } catch {
    return []
  }
  // the chord's usual name, e.g. "Cmaj7" for "CM7"
  const [name] = searchChords(search, instrument, 1)

  return Array.from({ length: voicings }, (_, voicing) => ({
    name,
    instrument,
    voicing,
    chord: getChord(name, voicing, instrument)
  }))
}

/**
 * The editor can't have a muted or open string under a barre, so a barre across one is split into
 * the parts on either side of it. A part on a single string becomes a finger.
 */
function splitBarresAtUnfrettedStrings({
  fingers,
  barres
}: Chord): Pick<Chord, 'fingers' | 'barres'> {
  const unfretted = new Set(
    fingers.filter(([, fret]) => fret === 'x' || fret === 0).map(([string]) => string)
  )
  const splitFingers: Finger[] = []
  const splitBarres: Barre[] = []

  barres.forEach((barre) => {
    const parts: number[][] = [[]]
    for (let string = barre.fromString; string >= barre.toString; string--) {
      if (unfretted.has(string)) {
        parts.push([])
      } else {
        parts[parts.length - 1].push(string)
      }
    }

    parts
      .filter((part) => part.length > 0)
      .forEach((part) => {
        if (part.length === 1) {
          splitFingers.push([part[0], barre.fret, ...(barre.text ? [barre.text] : [])] as Finger)
        } else {
          splitBarres.push({ ...barre, fromString: part[0], toString: part[part.length - 1] })
        }
      })
  })

  return { fingers: [...fingers, ...splitFingers], barres: splitBarres }
}

/**
 * The chart with the chord of a search result, keeping the look of the current chart.
 */
export function chartFromSearchResult(
  { name, instrument, chord }: ChordSearchResult,
  settings: ChartSettings
): Chart {
  const numStrings = strings[instrument]

  return {
    chord: splitBarresAtUnfrettedStrings(chord),
    settings: {
      ...settings,
      title: name,
      position: chord.position ?? 1,
      strings: numStrings,
      frets: 4,
      tuning: Array(numStrings).fill('')
    }
  }
}
