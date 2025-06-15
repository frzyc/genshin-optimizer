import type {
  DataManagerBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useCallback, useSyncExternalStore } from 'react'

export function useDataManagerValues<
  A extends string,
  B extends string,
  C extends D,
  D,
  E extends Database,
>(dataManager: DataManagerBase<A, B, C, D, E>) {
  return useSyncExternalStore(
    useCallback((cb) => dataManager.followAny(() => cb()), [dataManager]),
    () => dataManager.values
  )
}
