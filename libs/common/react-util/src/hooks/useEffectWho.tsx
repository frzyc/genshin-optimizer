'use client'
import { useEffect } from 'react'

/**
 * A debug utility function. Should not be used in prod code.
 */
export function useEffectWho(who: { [key: string]: any }) {
  for (const [key, a] of Object.entries(who)) {
    // biome-ignore lint/correctness/useExhaustiveDependencies: debug
    useEffect(() => {
      console.log('useEffect:', key)
    }, [a])
  }
}
