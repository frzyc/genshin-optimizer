import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useMemo } from 'react'
export function useDiscSets(
  discs: Record<DiscSlotKey, ICachedDisc | undefined>
) {
  return useMemo(() => {
    const sets: Partial<Record<DiscSetKey, number>> = {}
    Object.values(discs).forEach((disc) => {
      const setKey = disc?.setKey
      if (!setKey) return
      sets[setKey] = (sets[setKey] || 0) + 1
    })
    return Object.fromEntries(
      Object.entries(sets)
        .map(([setKey, count]): [DiscSetKey, number] => {
          if (count >= 4) return [setKey as DiscSetKey, 4]
          if (count >= 2) return [setKey as DiscSetKey, 2]
          return [setKey as DiscSetKey, 0]
        })
        .filter(([, count]) => count > 0)
    ) as Partial<Record<DiscSetKey, 2 | 4>>
  }, [discs])
}
