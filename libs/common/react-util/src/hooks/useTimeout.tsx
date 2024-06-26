'use client'
import { useCallback, useRef } from 'react'

export function useTimeout() {
  const timeout = useRef(undefined as undefined | ReturnType<typeof setTimeout>)
  return useCallback((cb: () => void, time: number) => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      cb()
      timeout.current = undefined
    }, time)
  }, [])
}
