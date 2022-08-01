import { useEffect, useState } from 'react'

/**
 * Padding of the container
 */
const PADDING = 15

/**
 * Maximum width of the chord chart
 */
const MAX_WIDTH = 400

export const useResizeHandler = () => {
  let screenWidth = MAX_WIDTH

  if (typeof window !== 'undefined') {
    screenWidth = window.screen.availWidth
  }

  const [width, setWidth] = useState(Math.min(screenWidth, MAX_WIDTH - PADDING * 2))

  useEffect(() => {
    const handleResize = () => {
      window.requestAnimationFrame(() => setWidth(screenWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })

  const finalWidth = Math.min(width, MAX_WIDTH) - PADDING * 2

  return { width: finalWidth, height: finalWidth * 1.5 }
}
