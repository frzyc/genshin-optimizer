import { objKeyMap, objMap } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useEffect, useState } from 'react'
import { useDatabaseContext } from '../context'

const emptydiscIds = objKeyMap(allDiscSlotKeys, () => undefined)

/**
 * A hook to keep a "build" of relics in sync with the database
 */
export function useDiscs(
  discIds: Record<DiscSlotKey, string | undefined> | undefined = emptydiscIds
) {
  const { database } = useDatabaseContext()
  const [relics, setRelics] = useState<
    Record<DiscSlotKey, ICachedDisc | undefined>
  >(() => objMap(discIds, (id) => database.discs.get(id)))

  useEffect(() => {
    setRelics(objMap(discIds, (id) => database.discs.get(id)))
    const unfollows = Object.values(discIds).map((relicId) =>
      relicId
        ? database.discs.follow(relicId, (_k, r, v: ICachedDisc) => {
            if (r === 'update')
              setRelics((relics) => ({ ...relics, [v.slotKey]: v }))
            // remove event returns the deleted obj
            if (r === 'remove')
              setRelics((relics) => ({ ...relics, [v.slotKey]: undefined }))
          })
        : () => {}
    )
    return () => unfollows.forEach((unfollow) => unfollow())
  }, [database, discIds])

  return relics
}
