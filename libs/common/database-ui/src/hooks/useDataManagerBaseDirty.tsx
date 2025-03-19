import type {
  DataManagerBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { useEffect } from 'react'

export function useDataManagerBaseDirty<
  A extends string,
  B extends string,
  C extends D,
  D,
  E extends Database,
>(manager: DataManagerBase<A, B, C, D, E>) {
  const [dirty, setDirty] = useForceUpdate()
  useEffect(
    () => manager.followAny((_k, r) => r === 'update' && setDirty()),
    [manager, setDirty]
  )
  return dirty
}
