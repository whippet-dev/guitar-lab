import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type KeyboardEvent, type Ref } from 'react'
import { MAX_FRET, noteName, pitchAt, positionName, samePosition, STRINGS, type Position, type StringIndex } from '../music/theory'

type ToneKind = 'root' | 'third' | 'fifth'
type Marker = { label: string; kind?: ToneKind | 'target'; spokenLabel?: string; comparison?: 'shared' | 'neighbour' }
export type FretboardView = { visibleRange: () => readonly [number, number] }

export function toneKind(degree: number, semitones: number): ToneKind | undefined {
  if (degree === 1 || (degree === 8 && semitones === 12)) return 'root'
  if (degree === 3 && (semitones === 3 || semitones === 4)) return 'third'
  if (degree === 5 && semitones === 7) return 'fifth'
}

type FretboardProps = {
  range?: readonly [number, number]
  selected?: Position | null
  selectedPositions?: readonly Position[]
  onSelect: (position: Position) => void
  marker?: (position: Position) => Marker | undefined
  guideString?: StringIndex
  travelled?: { from: Position; to: Position }
  reveal?: Position | null
  locked?: boolean
  label?: string
  viewRef?: Ref<FretboardView>
}

const inlays = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
const stringGauges = [1, 1.12, 1.28, 1.5, 1.8, 2.12]

export function Fretboard({ range = [0, MAX_FRET], selected, selectedPositions, marker, onSelect, guideString, travelled, reveal, locked, label, viewRef }: FretboardProps) {
  const [first, last] = range
  const frets = Array.from({ length: last - first + 1 }, (_, index) => first + index)
  const firstFretted = Math.max(1, first)
  // Each fret gap follows the same equal-tempered ratio as the remaining string length.
  // Keep the taper above a touch-sized floor, even when the whole neck scrolls.
  const smallestGap = 2 ** ((firstFretted - last) / 12)
  let totalTaper = 0
  const columns = frets.map((fret) => {
    if (fret === 0) return 'minmax(var(--fret-width), 0.6fr)'
    const gap = 2 ** ((firstFretted - fret) / 12)
    const taper = gap - smallestGap
    totalTaper += taper
    return `minmax(calc(var(--fret-width) + var(--fret-taper) * ${taper}), ${gap}fr)`
  }).join(' ')
  const [cursor, setCursor] = useState<Position>({ string: guideString ?? 5, fret: first })
  const scroll = useRef<HTMLDivElement>(null)
  const fretLabel = useRef<HTMLSpanElement>(null)
  const activeFret = Math.max(first, Math.min(last, cursor.fret))

  useImperativeHandle(viewRef, () => ({
    visibleRange() {
      const container = scroll.current
      const label = fretLabel.current
      const row = label?.parentElement
      if (!container || !label || !row) return range
      const left = label.getBoundingClientRect().right
      const right = container.getBoundingClientRect().left + container.clientLeft + container.clientWidth
      const visibleFrets = Array.from(row.children).slice(1).flatMap((cell, index) => {
        const bounds = cell.getBoundingClientRect()
        return bounds.left >= left - 0.5 && bounds.right <= right + 0.5 ? [first + index] : []
      })
      return visibleFrets.length ? [visibleFrets[0], visibleFrets[visibleFrets.length - 1]] : range
    },
  }), [first, range])

  useEffect(() => {
    if (reveal) showFret(reveal)
  }, [reveal])

  function cellFor(position: Position) {
    return scroll.current?.querySelector<HTMLButtonElement>(`[data-position="${position.string}-${position.fret}"]`)
  }

  function showFret(position: Position) {
    const cell = cellFor(position)
    const container = scroll.current
    if (!cell || !container) return
    const leftEdge = fretLabel.current?.getBoundingClientRect().right ?? container.getBoundingClientRect().left
    const rightEdge = container.getBoundingClientRect().left + container.clientLeft + container.clientWidth
    const { left, right } = cell.getBoundingClientRect()
    if (left < leftEdge) container.scrollLeft += left - leftEdge
    if (right > rightEdge) container.scrollLeft += right - rightEdge + 2
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, from: Position) {
    const next = { ...from }
    switch (event.key) {
      case 'ArrowLeft': next.fret = Math.max(first, from.fret - 1); break
      case 'ArrowRight': next.fret = Math.min(last, from.fret + 1); break
      case 'ArrowUp': next.string = Math.max(0, from.string - 1) as StringIndex; break
      case 'ArrowDown': next.string = Math.min(5, from.string + 1) as StringIndex; break
      case 'Home': next.fret = first; break
      case 'End': next.fret = last; break
      default: return
    }
    event.preventDefault()
    cellFor(next)?.focus({ preventScroll: true })
    showFret(next)
  }

  return (
    <div className="board-scroll" ref={scroll} role="group" aria-label={label ?? (locked ? 'Guitar fretboard showing the answer.' : 'Guitar fretboard. Use arrow keys to move and Enter or Space to select.')}>
      <div className={`board-grid${frets.length > 7 ? ' board-grid-wide' : ''}`} style={{ '--fret-count': frets.length, '--fret-columns': columns, '--total-taper': totalTaper } as CSSProperties}>
        <div className="board-row board-numbers" aria-hidden="true">
          <span className="string-label" ref={fretLabel}>Fret</span>
          {frets.map((fret) => <span key={fret} className={fret === 12 || fret === 24 ? 'octave-fret' : ''}>{fret}</span>)}
        </div>
        <div className="board-surface">
          <div className="board-row board-materials" aria-hidden="true">
            <span />
            {frets.map((fret) => <span key={fret} className={`board-fret${fret === 0 ? ' board-nut' : ''}`}>
              {inlays.includes(fret) && <><i className="board-dot" />{fret % 12 === 0 && <i className="board-dot" />}</>}
            </span>)}
          </div>
          {STRINGS.map(({ name }, index) => {
            const string = index as StringIndex
            return (
              <div className={`board-row board-string${string === guideString ? ' board-guide' : ''}`} key={name} style={{ '--string-width': `${stringGauges[index]}px` } as CSSProperties}>
                <span className="string-label" aria-hidden="true">{name === 'high E' ? 'e' : name === 'low E' ? 'E' : name}</span>
                {frets.map((fret) => {
                  const position = { string, fret }
                  const mark = marker?.(position)
                  const pressed = samePosition(selected, position) || !!selectedPositions?.some((item) => samePosition(item, position))
                  const inStep = travelled && string === travelled.from.string && string === travelled.to.string && fret >= travelled.from.fret && fret <= travelled.to.fret
                  return (
                    <button key={fret} type="button" data-position={`${string}-${fret}`}
                      className={`fret-cell${pressed ? ' is-selected' : ''}${inStep ? ' is-travelled' : ''}`}
                      aria-label={mark?.spokenLabel ?? `${positionName(position)}${mark ? `, ${mark.label}` : ''}`}
                      aria-pressed={pressed} aria-disabled={locked || undefined} tabIndex={cursor.string === string && activeFret === fret ? 0 : -1}
                      onFocus={() => setCursor(position)} onKeyDown={(event) => moveFocus(event, position)} onClick={() => { if (!locked) onSelect(position) }}>
                      {mark && <span className={`fret-note${mark.kind ? ` ${mark.kind}` : ''}${mark.comparison ? ` is-${mark.comparison}` : ''}`}>{mark.label}</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function noteMarker(position: Position, kind?: Marker['kind']): Marker {
  return { label: noteName(pitchAt(position)), kind }
}
