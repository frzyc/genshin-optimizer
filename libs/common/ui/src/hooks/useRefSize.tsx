'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * NOTE: the values of `width` & `height` starts at 0, since ref takes a rendering cycle to attach.
 * @returns
 */
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
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Safe to keep empty as we only want mount/unmount behavior
  return { width, height, ref }
}
