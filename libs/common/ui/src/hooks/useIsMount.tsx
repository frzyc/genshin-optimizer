'use client'
import { useEffect, useRef } from 'react'

/**
 * @returns true if it is the currently the initial rendering of the component
 */
export function useIsMount() {
  const isMountRef = useRef(true)
  useEffect(() => {
    isMountRef.current = false
  }, [])
  return isMountRef.current
}
