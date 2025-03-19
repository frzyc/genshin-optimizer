'use client'
import type {
  DataEntryBase,
  Database,
} from '@genshin-optimizer/common/database'
import { useEffect, useState } from 'react'
export function useDataEntryBase<
  A extends string,
  B extends string,
  C,
  D,
  E extends Database,
>(entry: DataEntryBase<A, B, C, D, E>) {
  const [data, setData] = useState(() => entry?.get())

  useEffect(() => {
    setData(entry?.get())
    return entry?.follow((r, v) => r === 'update' && setData(v))
  }, [entry])
  return data
}
