'use client'
import type {
  DataEntryBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useCallback, useSyncExternalStore } from 'react'
export function useDataEntryBase<
  A extends string,
  B extends string,
  C,
  D,
  E extends Database,
>(entry: DataEntryBase<A, B, C, D, E>) {
  return useSyncExternalStore(
    useCallback(
      (callback: () => void) =>
        entry?.follow((r) => r === 'update' && callback()),
      [entry]
    ),
    () => entry.get()
  )
}
