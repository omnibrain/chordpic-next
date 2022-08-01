import { useCallback, useEffect } from 'react'

const ESC_KEYCODE = 27

export const useEscHandler = (onEsc: (event: Event) => any) => {
  /**
   * Close color picker with ESC
   */
  const escFunction = useCallback((event) => {
    if (event.keyCode === ESC_KEYCODE) {
      onEsc(event)
    }
  }, [])
  useEffect(() => {
    document.addEventListener('keydown', escFunction, false)

    return () => {
      document.removeEventListener('keydown', escFunction, false)
    }
  }, [])
}
