import { useState } from 'react'

function setAndPersistValue<T>(key: string, setter: (v: T) => void) {
  return function (value: T) {
    // persist if window is defined
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value))
    }

    setter(value)
  }
}

function loadWithDefault<T>(key: string, defaultValue: T): T {
  // return default state if window is not defined
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const loaded = window.localStorage.getItem(key)

  if (loaded) {
    return JSON.parse(loaded) as T
  }

  return defaultValue
}

/**
 * Persist state in local storage. The initial value is only used if no state has been stored.
 * @param key
 * @param initialValue
 */
export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState(loadWithDefault(key, initialValue))

  return [value, setAndPersistValue(key, setValue)]
}
