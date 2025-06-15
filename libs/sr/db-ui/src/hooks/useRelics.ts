import { objKeyMap } from '@genshin-optimizer/common/util'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import type { RelicIds } from '@genshin-optimizer/sr/db'
import { useMemo } from 'react'
import { useRelic } from './useRelic'

const emptyRelicIds = objKeyMap(allRelicSlotKeys, () => undefined)

/**
 * A hook to keep a "build" of relics in sync with the database
 */
export function useRelics(relicIds: RelicIds | undefined = emptyRelicIds) {
  const head = useRelic(relicIds.head)
  const body = useRelic(relicIds.body)
  const hands = useRelic(relicIds.hands)
  const feet = useRelic(relicIds.feet)
  const sphere = useRelic(relicIds.sphere)
  const propelume = useRelic(relicIds.rope)

  return useMemo(
    () => ({
      head,
      body,
      hands,
      feet,
      sphere,
      propelume,
    }),
    [head, body, hands, feet, sphere, propelume]
  )
}
