import { useEffect, useState } from 'react'

export function useInputState<T, V = T>(
  accessor: T,
  transform: (value: T) => V,
  validCallback: (value: V) => void,
  validator?: (value: V) => boolean
): [V, (value: V) => void] {
  const [localValue, setLocalValue] = useState(transform(accessor))

  useEffect(() => {
    setLocalValue(transform(accessor))
  }, [accessor])

  const setter = (value: V) => {
    // lift state if valid, use local value setter instead
    if (!validator || validator(value)) {
      validCallback(value)
    } else {
      setLocalValue(value)
    }
  }

  return [localValue, setter]
}
