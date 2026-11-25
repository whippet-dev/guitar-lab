export const INSTRUMENTS = {
  electric: 'Clean electric guitar',
  acoustic: 'Acoustic guitar',
  reference: 'Pure reference tone',
} as const

export type Instrument = keyof typeof INSTRUMENTS

let selected: Instrument = 'electric'
let canStore = true

function storageKey() {
  const scope = import.meta.env.BASE_URL === './' ? window.location.pathname.replace(/index\.html$/, '') : import.meta.env.BASE_URL
  return `guitar-lab:instrument:${scope}`
}

export function getInstrument(): Instrument {
  if (canStore) {
    try {
      const value = localStorage.getItem(storageKey())
      if (value === 'electric' || value === 'acoustic' || value === 'reference') return value
    } catch {
      canStore = false
    }
  }
  return selected
}

export function setInstrument(value: Instrument) {
  selected = value
  try {
    localStorage.setItem(storageKey(), value)
    canStore = true
  } catch {
    canStore = false
  }
}
