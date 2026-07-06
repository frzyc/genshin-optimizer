import { useDeferredValue, useEffect, useRef, useState } from 'react'

/**
 * NOTE: the values of `width` & `height` starts at 0, since ref takes a rendering cycle to attach.
 * @param deferred - When true, returns deferred values that update less frequently to improve performance
 * @returns
 */
export function useRefSize(deferred = false) {
  const ref = useRef<HTMLElement>()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const deferredWidth = useDeferredValue(width)
  const deferredHeight = useDeferredValue(height)
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
  if (deferred) return { width: deferredWidth, height: deferredHeight, ref }
  return { width, height, ref }
}
