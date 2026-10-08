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
  voicings: number
  chord: Chord
}

const maxResults = 24

const strings: Record<Instrument, number> = { guitar: 6, ukulele: 4 }

function getChord(name: string, voicing: number, instrument: Instrument): Chord {
  return instrument === 'ukulele' ? getUkuleleChord(name, voicing) : getGuitarChord(name, voicing)
}

/**
 * Every voicing of the best match first, then the first voicing of the other chords that start
 * with the search.
 */
export function findChords(query: string, instrument: Instrument): ChordSearchResult[] {
  const [best, ...others] = searchChords(query, instrument, maxResults)
  if (!best) {
    return []
  }

  const result = (name: string, voicing: number): ChordSearchResult => ({
    name,
    instrument,
    voicing,
    voicings: chordVoicings(name, instrument),
    chord: getChord(name, voicing, instrument)
  })

  return [
    ...Array.from({ length: chordVoicings(best, instrument) }, (_, voicing) =>
      result(best, voicing)
    ),
    ...others.map((name) => result(name, 0))
  ].slice(0, maxResults)
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
