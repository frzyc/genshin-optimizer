import { objKeyMap, objMap } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useEffect, useState } from 'react'
import { useDatabaseContext } from '../context'

const emptydiscIds = objKeyMap(allDiscSlotKeys, () => undefined)

/**
 * A hook to keep a "build" of discs in sync with the database
 */
export function useDiscs(
  discIds: Record<DiscSlotKey, string | undefined> | undefined = emptydiscIds,
) {
  const { database } = useDatabaseContext()
  const [discs, setDiscs] = useState<
    Record<DiscSlotKey, ICachedDisc | undefined>
  >(() => objMap(discIds, (id) => database.discs.get(id)))

  useEffect(() => {
    setDiscs(objMap(discIds, (id) => database.discs.get(id)))
    const unfollows = Object.values(discIds).map((discId) =>
      discId
        ? database.discs.follow(discId, (_k, r, v: ICachedDisc) => {
            if (r === 'update')
              setDiscs((discs) => ({ ...discs, [v.slotKey]: v }))
            // remove event returns the deleted obj
            if (r === 'remove')
              setDiscs((discs) => ({ ...discs, [v.slotKey]: undefined }))
          })
        : () => {},
    )
    return () => unfollows.forEach((unfollow) => unfollow())
  }, [database, discIds])

  return discs
}
