import chunk from 'lodash.chunk'
import range from 'lodash.range'
import { Barre, Chord, ChordSettings, Finger, FingerOptions, OPEN, OpenString, Shape, SILENT, SilentString } from 'svguitar'

export enum CellState {
  ACTIVE, // single finger
  INACTIVE, // single finger
  MIDDLE,
  LEFT,
  RIGHT,
  MIDDLE_HL,
  LEFT_HL,
  RIGHT_HL
}

export interface Cell {
  state: CellState
  text?: string
  color?: string
  textColor?: string
  shape?: Shape
}

type CellOptions = Omit<Cell, 'state'>

export enum EmptyStringState {
  X,
  O,
  NOT_EMPTY
}

/**
 * This class contains all the logic of the chords. The state is held in a 1D array. Each mutating operation will
 * return a new instance.
 */
export class ChordMatrix {
  constructor(
    public numFrets: number,
    public numStrings: number,
    private cells: Cell[] = Array(numStrings * numFrets).fill({ state: CellState.INACTIVE }),
    private emptyStringsStates: EmptyStringState[] = Array(numStrings).fill(EmptyStringState.O)
  ) {}

  static fromChart({ chord, settings }: { chord: Chord; settings: ChordSettings }): ChordMatrix {
    if (!settings.frets || !settings.strings) {
      throw new Error('Cannot create matrix if frets or strings is not known')
    }
    const numFrets = settings.frets
    const numStrings = settings.strings

    const cells: Cell[] = Array(numFrets * numStrings).fill({ state: CellState.INACTIVE })
    const emptyStringsStates = Array(numStrings).fill(EmptyStringState.O)

    chord.fingers.forEach(([string, fret, textOrOptions]: Finger) => {
      const stringIndex = Math.abs(string - numStrings)

      let options: CellOptions

      if (!textOrOptions) {
        options = {}
      } else if (typeof textOrOptions === 'string') {
        options = {
          text: textOrOptions
        }
      } else {
        options = textOrOptions
      }

      if (fret === OPEN) {
        emptyStringsStates[stringIndex] = EmptyStringState.O
      } else if (fret === SILENT) {
        emptyStringsStates[stringIndex] = EmptyStringState.X
      } else {
        cells[(fret - 1) * numStrings + stringIndex] = {
          state: CellState.ACTIVE,
          ...options
        }
      }
    })
    chord.barres.forEach(({ fromString, toString, fret, text }: Barre) => {
      const fromIndex = Math.abs(fromString - numStrings)
      const toIndex = Math.abs(toString - numStrings)

      cells[(fret - 1) * numStrings + fromIndex] = { state: CellState.LEFT, ...(text ? { text } : {}) }
      cells[(fret - 1) * numStrings + toIndex] = { state: CellState.RIGHT, ...(text ? { text } : {}) }

      if (toIndex - fromIndex >= 2) {
        for (let i = fromIndex + 1; i < toIndex; i++) {
          cells[(fret - 1) * numStrings + i] = { state: CellState.MIDDLE, ...(text ? { text } : {}) }
        }
      }
    })

    return new ChordMatrix(numFrets, numStrings, cells, emptyStringsStates)
  }

  clone() {
    return new ChordMatrix(this.numFrets, this.numStrings, this.cells, this.emptyStringsStates)
  }

  setNumFrets(numFrets: number): ChordMatrix {
    if (numFrets < this.numFrets) {
      this.cells = [...this.cells].splice(0, this.numStrings * numFrets)
    } else if (numFrets > this.numFrets) {
      this.cells = [...this.cells, ...Array((numFrets - this.numFrets) * this.numStrings).fill({ state: CellState.INACTIVE })]
    }

    this.numFrets = numFrets

    return this.clone()
  }

  setNumStrings(numStrings: number): ChordMatrix {
    const numStringsBefore = this.numStrings

    if (numStrings === numStringsBefore) {
      // do nothing;
      return this
    } else if (numStrings < numStringsBefore) {
      // reduce strings
      this.cells = this.cells.reduce<Cell[]>((acc, val, i) => {
        if (i % numStringsBefore >= numStrings) {
          // reduce the fret to this length if this is a fret
          if (val.state === CellState.RIGHT || val.state === CellState.MIDDLE) {
            acc[i - 1] = { state: CellState.RIGHT }
          }

          return acc
        } else {
          acc.push(val)

          return acc
        }
      }, [])

      this.emptyStringsStates = this.emptyStringsStates.splice(0, numStrings)
    } else {
      // increase strings
      this.cells = this.cells.reduce<Cell[]>((acc, val, i) => {
        acc.push(val)

        if (i > 0 && (i + 1) % numStringsBefore === 0) {
          acc.push(...Array(numStrings - numStringsBefore).fill({ state: CellState.INACTIVE }))
        }

        return acc
      }, [])

      this.emptyStringsStates = [...this.emptyStringsStates, ...Array(numStrings - numStringsBefore).fill(EmptyStringState.O)]
    }

    this.numStrings = numStrings

    return this.clone()
  }

  get rows(): Cell[][] {
    return chunk(this.cells, this.numStrings)
  }

  get strings(): Cell[][] {
    return this.cells.reduce<Cell[][]>(
      (strings, s, i) => {
        strings[i % this.numStrings].push(s)

        return strings
      },
      Array(this.numStrings)
        .fill(0)
        .map(() => [])
    )
  }

  getSections(fret: number): { length: number; string: number; empty: boolean }[] {
    const row = this.rows[fret]

    const result: { empty: boolean; length: number; string: number }[] = []

    let length = 1
    for (let i = 1; i <= row.length; i++) {
      const prevState = row[i - 1].state
      const state = row[i] ? row[i].state : null

      if (
        prevState === CellState.ACTIVE ||
        (prevState === CellState.RIGHT && state === CellState.LEFT) ||
        (prevState === CellState.RIGHT && state === CellState.INACTIVE) ||
        (prevState === CellState.RIGHT && state === CellState.ACTIVE) ||
        (prevState === CellState.INACTIVE && state !== CellState.INACTIVE) ||
        state === null
      ) {
        result.push({ empty: prevState === CellState.INACTIVE, length, string: i - length })
        length = 1
      } else {
        length += 1
      }
    }

    return result
  }

  getCellState(fret: number, string: number): CellState {
    return this.get(fret, string).state
  }

  get(fret: number, string: number): Cell {
    const cell = this.cells[fret * this.numStrings + string]
    if (!cell) {
      throw new Error(`Invalid index: fret=${fret}, string=${string}`)
    }

    return this.cells[fret * this.numStrings + string]
  }

  private setCellState(string: number, fret: number, state: CellState): ChordMatrix {
    const cellIndex = this.getIndex(string, fret)
    const currentCell = this.cells[cellIndex]

    // special case when settings to incactive: remove all other state as well
    this.cells[cellIndex] = state === CellState.INACTIVE ? { state } : { ...currentCell, state }

    return this.clone()
  }

  private set(string: number, fret: number, cell: CellOptions): ChordMatrix {
    const stateIndex = this.getIndex(string, fret)

    const currentCell: Cell = this.cells[stateIndex]

    const updateCell = (cellToUpdate: Cell, update: CellOptions) =>
      Object.entries({
        ...cellToUpdate,
        ...update
      })
        .filter(([, v]) => v != null)
        .reduce<Cell>(
          (acc, [k, v]) => ({
            ...acc,
            [k]: v
          }),
          {} as Cell
        )

    this.cells[stateIndex] = updateCell(currentCell, cell)

    if (this.isBarreState(currentCell.state)) {
      this.forEachBarreCell(string, fret, (str, fr, curCell) => {
        this.cells[this.getIndex(str, fr)] = updateCell(curCell, cell)
      })
    }

    return this.clone()
  }

  private forEachBarreCell(string: number, fret: number, callback: (string: number, fret: number, cell: Cell) => void) {
    if (!this.isBarreState(this.getCellState(fret, string))) {
      throw new Error(`No barre chord found at string=${string}, fret=${fret}.`)
    }

    callback(string, fret, this.cells[this.getIndex(string, fret)])

    let stringIndex = string - 1

    while (
      stringIndex >= 0 &&
      [CellState.LEFT, CellState.MIDDLE, CellState.LEFT_HL, CellState.MIDDLE_HL].includes(this.getCellState(fret, stringIndex))
    ) {
      callback(stringIndex, fret, this.cells[this.getIndex(stringIndex, fret)])
      stringIndex -= 1
    }

    stringIndex = string + 1

    while (
      stringIndex < this.numStrings &&
      [CellState.RIGHT, CellState.MIDDLE, CellState.RIGHT_HL, CellState.MIDDLE_HL].includes(this.getCellState(fret, stringIndex))
    ) {
      callback(stringIndex, fret, this.cells[this.getIndex(stringIndex, fret)])
      stringIndex += 1
    }
  }

  toggleEmptyState(string: number): ChordMatrix {
    this.emptyStringsStates[string] = this.emptyStringsStates[string] === EmptyStringState.O ? EmptyStringState.X : EmptyStringState.O

    return this.clone()
  }

  isEmptyString(string: number) {
    return !this.strings[string].some(({ state }) => [CellState.ACTIVE, CellState.LEFT, CellState.RIGHT, CellState.MIDDLE].includes(state))
  }

  getEmptyStringStates(): EmptyStringState[] {
    return range(0, this.numStrings).map((i) => (this.isEmptyString(i) ? this.emptyStringsStates[i] : EmptyStringState.NOT_EMPTY))
  }

  toggle(string: number, fret: number): ChordMatrix {
    // when clicking on a barre chord the barre chord is removed
    if (this.isBarreState(this.getCellState(fret, string))) {
      this.fretIndices(fret).forEach((i) => {
        if (this.isBarreState(this.cells[i].state)) {
          this.cells[i] = { state: CellState.INACTIVE }
        }
      })
    }

    return this.setCellState(string, fret, this.getCellState(fret, string) !== CellState.INACTIVE ? CellState.INACTIVE : CellState.ACTIVE)
  }

  text(string: number, fret: number, text?: string) {
    return this.set(string, fret, { text })
  }

  color(string: number, fret: number, color?: string) {
    return this.set(string, fret, { color })
  }

  nextShape(string: number, fret: number) {
    const currentShape = this.get(fret, string).shape ?? Shape.CIRCLE
    const shapes = Object.values(Shape)
    const nextIndex = shapes.findIndex((shape) => shape === currentShape) + (1 % shapes.length)

    return this.set(string, fret, { shape: shapes[nextIndex] })
  }

  connect(fret: number, fromString: number, toString: number): ChordMatrix {
    this.drawBarre(fret, fromString, toString)
    return this.clone()
  }

  /**
   * This will actually connect the highlighted strings. So it will take the highlighted connection and make it an actual connection.
   */
  connectHighlighted() {
    // return the same instance if no cells are highlighted
    if (!this.cells.some(({ state }) => [CellState.LEFT_HL, CellState.RIGHT_HL, CellState.MIDDLE_HL].includes(state))) {
      return this
    }

    this.cells = this.cells.map((cell) => {
      switch (cell.state) {
        case CellState.LEFT_HL:
          return { ...cell, state: CellState.LEFT }
        case CellState.RIGHT_HL:
          return { ...cell, state: CellState.RIGHT }
        case CellState.MIDDLE_HL:
          return { ...cell, state: CellState.MIDDLE }
        default:
          return cell
      }
    })

    return this.clone()
  }

  connectHighlight(fret: number, fromString: number, toString: number) {
    this.drawBarre(fret, fromString, toString, true)
    return this.clone()
  }

  private drawBarre(fret: number, fromString: number, toString: number, highlight = false) {
    const from = Math.min(fromString, toString)
    const to = Math.max(fromString, toString)

    // input validation
    if (fret > this.numFrets - 1) {
      throw new Error(`Fret ${fret} is out of range.`)
    }
    if (Math.abs(from - to) < 1) {
      throw new Error('Strings must be at least 1 apart from each other')
    }
    if (from < 0 || from >= this.numStrings) {
      throw new Error(`fromString is out of range`)
    }
    if (to < 0 || to >= this.numStrings) {
      throw new Error(`toString is out of range`)
    }

    // clear barre chords that are "cut off" by this new barre chord
    range(from, to + 1).forEach((string) => {
      if (this.isBarreState(this.getCellState(fret, string))) {
        this.removeBarre(fret, string)
        return
      }
    })

    // create the barre chord
    range(from, to + 1).forEach((string, count) => {
      let state: CellState

      if (count === 0) {
        state = highlight ? CellState.LEFT_HL : CellState.LEFT
      } else if (count === to - from) {
        state = highlight ? CellState.RIGHT_HL : CellState.RIGHT
      } else {
        state = highlight ? CellState.MIDDLE_HL : CellState.MIDDLE
      }

      this.setCellState(string, fret, state)
    })
  }

  private removeBarre(fret: number, string: number) {
    const state = this.getCellState(fret, string)

    if (this.isBarreState(state)) {
      this.forEachBarreCell(string, fret, (str, fr) => this.setCellState(str, fr, CellState.INACTIVE))
    }
  }

  print() {
    const stateToAscii = (s: Cell): string => {
      switch (s.state) {
        case CellState.ACTIVE:
          return 'X'
        case CellState.INACTIVE:
          return ' '
        case CellState.RIGHT:
          return '>'
        case CellState.LEFT:
          return '<'
        case CellState.RIGHT_HL:
          return ')'
        case CellState.LEFT_HL:
          return '('
        case CellState.MIDDLE:
          return '='
        case CellState.MIDDLE_HL:
          return '-'
      }
    }

    const ascii = this.rows.reduce((acc, row) => {
      return `${acc}|${row.map(stateToAscii).join('|')}|\n`
    }, '')

    console.log(ascii)
  }

  /**
   * Transforms the internal representation of the cell states to to a form that is understood by vexchords.
   */
  toChord(): Finger[] {
    const newState = [...this.cells]
      .splice(0, this.numFrets * this.numStrings)
      .reduce<[number, number, Cell][]>(
        (acc, cell, i) =>
          cell.state === CellState.ACTIVE
            ? [...acc, [Math.abs((i % this.numStrings) - this.numStrings), Math.floor(i / this.numStrings + 1), cell]]
            : acc,
        []
      )
      // remove data that is meaningless for svguitar
      .map<[number, number | OpenString | SilentString, FingerOptions]>(([x, y, cell]) => [
        x,
        y,
        {
          ...(cell.text ? { text: cell.text } : {}),
          ...(cell.color ? { color: cell.color } : {}),
          ...(cell.textColor ? { textColor: cell.textColor } : {}),
          ...(cell.shape ? { shape: cell.shape } : {})
        }
      ])
      // remove finger settings if empty
      .map<Finger>(([string, fret, options]) => {
        if (Object.keys(options).length) {
          return [string, fret, options]
        }

        return [string, fret]
      })

    const emptyStringStates = this.emptyStringIndices().map<Finger>((stringIndex) => {
      return [Math.abs(stringIndex - this.numStrings), this.emptyStringsStates[stringIndex] === EmptyStringState.O ? 0 : 'x']
    })

    return [...newState, ...emptyStringStates]
  }

  /**
   * Transforms the internal representation of the cell states to to a form that is understood by vexchords.
   */
  toBarres(): Barre[] {
    return this.cells.reduce((barres, cell, i) => {
      const { fret, string } = this.translate(i)

      const vexString = Math.abs(string - this.numStrings)
      const vexFret = fret + 1

      if (cell.state === CellState.LEFT) {
        barres = [...barres, { fromString: vexString, toString: vexString, fret: vexFret, text: cell.text, color: cell.color }]
      } else if (cell.state === CellState.RIGHT) {
        barres[barres.length - 1].toString = vexString
      }

      return barres
    }, [] as Barre[])
  }

  toVexchord(): Chord {
    return {
      fingers: this.toChord(),
      barres: this.toBarres()
    }
  }

  private emptyStringIndices(): number[] {
    return range(0, this.numStrings).reduce((acc, string) => (this.isEmptyString(string) ? [...acc, string] : acc), [] as number[])
  }

  private getIndex(string: number, fret: number): number {
    return fret * this.numStrings + string
  }

  private fretIndices(fret: number): number[] {
    const start = fret * this.numStrings
    const end = start + this.numStrings
    return range(start, end)
  }

  private isBarreState(state: CellState) {
    return [CellState.LEFT, CellState.RIGHT, CellState.MIDDLE, CellState.LEFT_HL, CellState.RIGHT_HL, CellState.MIDDLE_HL].includes(state)
  }

  translate(i: number): { string: number; fret: number } {
    return {
      string: i % this.numStrings,
      fret: Math.floor(i / this.numStrings)
    }
  }
}
