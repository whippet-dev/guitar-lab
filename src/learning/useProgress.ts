import { useCallback, useEffect, useRef, useState } from 'react'
import { EMPTY_PROGRESS, parseProgress, type Progress } from './progress'

const storageKey = `guitar-lab:progress:${import.meta.env.BASE_URL === './' ? window.location.pathname.replace(/index\.html$/, '') : import.meta.env.BASE_URL}`

function readStorage() {
  try {
    return parseProgress(window.localStorage.getItem(storageKey))
  } catch {
    return null
  }
}

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useProgress() {
  const [progress, setProgress] = useState(() => readStorage() ?? EMPTY_PROGRESS)
  const current = useRef(progress)
  const canWrite = useRef(true)
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (canWrite.current && (event.key === storageKey || event.key === null)) {
        const latest = readStorage()
        if (latest) {
          current.current = latest
          setProgress(latest)
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((change: (latest: Progress) => Progress) => {
    const latest = (canWrite.current ? readStorage() : null) ?? current.current
    const updated = change(latest)
    current.current = updated
    setProgress(updated)
    if (updated === latest || !canWrite.current) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      canWrite.current = false
      setStorageAvailable(false)
    }
  }, [])

  return { progress, update, storageAvailable }
}
