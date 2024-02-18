import type {
  Database,
  DataManagerBase,
} from '@genshin-optimizer/common/database'
import { useEffect, useState } from 'react'
export function useDataManagerBase<
  A extends string,
  B extends string,
  C extends D,
  D,
  E extends Database
>(manager: DataManagerBase<A, B, C, D, E>, key: A) {
  const [data, setData] = useState(() => manager.get(key))

  useEffect(() => {
    setData(manager.get(key))
    return manager.follow(key, (k, r, v) => {
      if (r === 'update') setData(v)
      if (r === 'remove') setData(undefined)
    })
  }, [manager, key, setData])
  return data
}
