'use client'
import type {
  DataManagerBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { useEffect, useMemo } from 'react'

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
  const [dbDirty, setDBDirty] = useForceUpdate()
  const data = useMemo(
    () => dbDirty && manager.get(key),
    [dbDirty, manager, key]
  )
  useEffect(() => manager.follow(key, setDBDirty), [manager, key, setDBDirty])
  return data
}
