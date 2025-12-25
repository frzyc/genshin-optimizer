import { useRef } from 'react'

export function usePrev<T>(value: T): T {
  const ref = useRef<T>(value)

  const prev = ref.current
  ref.current = value

  return prev
}

export function useIsPrev<T>(value: T) {
  return usePrev(value) === value
}
