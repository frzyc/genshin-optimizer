import { objKeyMap, objMap } from '@genshin-optimizer/common/util'
import {
  allRelicSlotKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import type { ICachedRelic, RelicIds } from '@genshin-optimizer/sr/db'
import { useEffect, useState } from 'react'
import { useDatabaseContext } from '../context'

const emptyRelicIds = objKeyMap(allRelicSlotKeys, () => undefined)

/**
 * A hook to keep a "build" of relics in sync with the database
 */
export function useRelics(relicIds: RelicIds | undefined = emptyRelicIds) {
  const { database } = useDatabaseContext()
  const [relics, setRelics] = useState<
    Record<RelicSlotKey, ICachedRelic | undefined>
  >(() => objMap(relicIds, (id) => database.relics.get(id)))

  useEffect(() => {
    setRelics(objMap(relicIds, (id) => database.relics.get(id)))
    const unfollows = Object.values(relicIds).map((relicId) =>
      relicId
        ? database.relics.follow(relicId, (_k, r, v: ICachedRelic) => {
            if (r === 'update')
              setRelics((relics) => ({ ...relics, [v.slotKey]: v }))
            // remove event returns the deleted obj
            if (r === 'remove')
              setRelics((relics) => ({ ...relics, [v.slotKey]: undefined }))
          })
        : () => {},
    )
    return () => unfollows.forEach((unfollow) => unfollow())
  }, [database, relicIds])

  return relics
}
