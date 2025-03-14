'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Use the IntersectionObserver API to observe if an element is shown on screen.
 * @param element The HTML element to observe
 * @returns
 */
export function useOnScreen(element?: HTMLElement) {
  const [isOnScreen, setIsOnScreen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  if (!observerRef.current && typeof window !== 'undefined')
    observerRef.current = new IntersectionObserver(([entry]) =>
      setIsOnScreen(entry.isIntersecting),
    )
  useEffect(() => {
    setIsOnScreen(false)
    if (!observerRef.current) return
    if (!element) return
    observerRef.current.observe(element)
    return () => {
      observerRef.current?.disconnect()
    }
  }, [element])
  return isOnScreen
}
