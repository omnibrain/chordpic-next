import { MutableRefObject, useEffect } from 'react'

const handleClick = (ref: MutableRefObject<HTMLElement | null | undefined>, callback: () => void) => (e: MouseEvent) => {
  if (!(ref.current && e.target instanceof Element && ref.current.contains(e.target))) {
    // outside click
    callback()
  }
}

export const useOutsideHandler = (ref: MutableRefObject<HTMLElement | null | undefined>, callback: () => void) => {
  useEffect(() => {
    const listener = handleClick(ref, callback)
    // add when mounted
    document.addEventListener('mousedown', listener)
    // return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [])
}
