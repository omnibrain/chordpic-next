import { useState } from 'react'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

function goToHash(hash: string) {
  window.history.pushState(null, window.document.title, `#${hash}`)
}

function setAndPersistValue<T>(setter: (v: T) => void) {
  return function (value: T) {
    const compressedState = compressToEncodedURIComponent(JSON.stringify(value))
    goToHash(compressedState)

    setter(value)
  }
}

export function getLink<T>(value: T, path = '/'): string {
  const compressedState = compressToEncodedURIComponent(JSON.stringify(value))

  return `${window.origin}${path}${path.endsWith('/') ? '' : '/'}${compressedState}`
}

function loadWithDefault<T>(defaultValue: T): T {
  // if we're not running in a browser simply return the default value
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const compressed = window.location.hash.slice(1)

  if (!compressed) {
    // no hash
    return defaultValue
  }

  try {
    const decompressed = decompressFromEncodedURIComponent(compressed)
    return decompressed ? JSON.parse(decompressed) : null
  } catch (err) {
    // decompression failed -> return default value
    return defaultValue
  }
}

/**
 * Persist state in local storage. The initial value is only used if no state has been stored.
 * @param key
 * @param initialValue
 * @param alwaysUpdate if true the url will update on every state update
 */
export function useUrlState<T>(initialValue: T, alwaysUpdate?: boolean): [T, (value: T) => void] {
  const [value, setValue] = useState(loadWithDefault(initialValue))

  return [value, alwaysUpdate ? setAndPersistValue(setValue) : setValue]
}
