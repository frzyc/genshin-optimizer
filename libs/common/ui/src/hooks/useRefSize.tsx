'use client'
import { useEffect, useRef, useState } from 'react'

export function useRefSize() {
  const ref = useRef<HTMLElement>()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setWidth(ref.current?.clientWidth ?? 0)
      setHeight(ref.current?.clientHeight ?? 0)
    }
    handleResize() // Check on mount and whenever the window resizes
    if (ref.current) window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return { width, height, ref }
}
