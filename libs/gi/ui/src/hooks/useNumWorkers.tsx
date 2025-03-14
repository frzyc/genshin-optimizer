'use client'
import { clamp } from '@genshin-optimizer/common/util'
import { useCallback, useEffect, useState } from 'react'
const LS_KEY = 'num_opt_workers'
export function useNumWorkers() {
  const nativeThreads = navigator?.hardwareConcurrency || 8
  const [numWorkers, setNumWorkers] = useState(() => {
    const lsItem = localStorage.getItem(LS_KEY)
    if (!lsItem) return nativeThreads
    const numWorkers = parseInt(lsItem)
    if (!Number.isInteger(numWorkers)) return nativeThreads
    return numWorkers
  })
  const clampedNumWOrkers = clamp(numWorkers, 1, nativeThreads)
  useEffect(() => {
    localStorage.setItem(LS_KEY, clampedNumWOrkers.toFixed())
  }, [clampedNumWOrkers])

  return [
    clampedNumWOrkers,
    nativeThreads,
    useCallback(
      (num: number) => {
        setNumWorkers(clamp(Math.round(num), 1, nativeThreads))
      },
      [nativeThreads],
    ),
  ] as const
}
