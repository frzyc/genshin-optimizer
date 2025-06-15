import type {
  DataManagerBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useCallback, useSyncExternalStore } from 'react'

export function useDataManagerKeys<
  A extends string,
  B extends string,
  C extends D,
  D,
  E extends Database,
>(dataManager: DataManagerBase<A, B, C, D, E>) {
  return useSyncExternalStore(
    useCallback(
      (cb) =>
        dataManager.followAny((_k, r) => {
          if (['new', 'remove'].includes(r)) cb()
        }),
      [dataManager]
    ),
    () => dataManager.keys
  )
}
