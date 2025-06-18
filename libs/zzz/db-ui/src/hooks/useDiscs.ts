import { objKeyMap } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { useMemo } from 'react'
import { useDisc } from './useDisc'

const emptydiscIds = objKeyMap(allDiscSlotKeys, () => undefined)

/**
 * A hook to keep a "build" of discs in sync with the database
 */
export function useDiscs(
  discIds: Record<DiscSlotKey, string | undefined> | undefined = emptydiscIds
) {
  const disc1 = useDisc(discIds['1'])
  const disc2 = useDisc(discIds['2'])
  const disc3 = useDisc(discIds['3'])
  const disc4 = useDisc(discIds['4'])
  const disc5 = useDisc(discIds['5'])
  const disc6 = useDisc(discIds['6'])

  return useMemo(
    () => ({
      '1': disc1,
      '2': disc2,
      '3': disc3,
      '4': disc4,
      '5': disc5,
      '6': disc6,
    }),
    [disc1, disc2, disc3, disc4, disc5, disc6]
  )
}
