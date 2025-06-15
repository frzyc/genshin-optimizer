'use client'
import { useRef } from 'react'

/**
 * @returns true if it is the currently the initial rendering of the component
 */
export function useIsMount() {
  const isMountRef = useRef(true)
  const isMount = isMountRef.current
  if (isMount) isMountRef.current = false

  return isMount
}
