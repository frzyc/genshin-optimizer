'use client'
import type {
  DataManagerBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useCallback, useSyncExternalStore } from 'react'

/**
 * Ensures data will change when key changes(without needing to wait another render)
 * and updates to data in db will trigger a rerender.
 */
export function useDataManagerBase<
  A extends string,
  B extends string,
  C extends D,
  D,
  E extends Database,
>(manager: DataManagerBase<A, B, C, D, E>, key: A) {
  return useSyncExternalStore(
    useCallback(
      (callback: () => void) => manager.follow(key, callback),
      [manager, key]
    ),
    () => manager.get(key)
  )
}
