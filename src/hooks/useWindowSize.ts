import { useEffect, useState } from 'react'

export const useWindowSize = (): { width: number; height: number } => {
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
      }

      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    } else {
      return
    }
  }, [])
  return { width, height }
}
