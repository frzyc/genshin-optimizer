import { useCallback, useRef } from 'react'

export function useScrollRef() {
  const scrollRef = useRef<HTMLElement>()
  const onScroll = useCallback(
    () => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }),
    []
  )
  return [scrollRef, onScroll] as const
}
