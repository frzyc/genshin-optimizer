import type { DataManagerBase } from '@genshin-optimizer/common/database'
import { useEffect, useState } from 'react'

export function useDatabaseTally(
  dataManager: DataManagerBase<any, any, any, any, any>,
) {
  const [total, setTotal] = useState(dataManager.keys.length)
  useEffect(() => {
    setTotal(dataManager.keys.length)
    return dataManager.followAny(
      (_k, r) =>
        ['new', 'remove'].includes(r) && setTotal(dataManager.keys.length),
    )
  }, [dataManager])
  return total
}
