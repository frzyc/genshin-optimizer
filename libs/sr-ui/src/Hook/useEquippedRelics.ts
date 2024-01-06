import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import { useEffect, useState } from 'react'
import { useDatabaseContext } from '../Context'
import { useCharacter } from './useCharacter'

export function useEquippedRelics(characterKey: CharacterKey | '') {
  const { database } = useDatabaseContext()
  const character = useCharacter(characterKey)
  const [relics, setRelics] = useState<
    Record<RelicSlotKey, ICachedRelic | undefined>
  >({} as Record<RelicSlotKey, ICachedRelic>)
  useEffect(() => {
    console.log(
      character?.equippedRelics &&
        (Object.fromEntries(
          Object.entries(character?.equippedRelics).map(
            ([slotKey, relicId]) => [
              slotKey,
              { ...database.relics.get(relicId) },
            ]
          )
        ) as Record<RelicSlotKey, ICachedRelic | undefined>)
    )
    return (
      character?.equippedRelics &&
      setRelics(
        Object.fromEntries(
          Object.entries(character?.equippedRelics).map(
            ([slotKey, relicId]) => [slotKey, database.relics.get(relicId)]
          )
        ) as Record<RelicSlotKey, ICachedRelic | undefined>
      )
    )
  }, [database, characterKey, character?.equippedRelics])

  useEffect(() => {
    const relicIds = character?.equippedRelics
      ? Object.values(character.equippedRelics)
      : []
    if (relicIds) {
      relicIds.forEach((relicId) =>
        database.relics.follow(
          relicId,
          (_k, r, v: ICachedRelic) =>
            (r === 'update' || r === 'remove') &&
            setRelics({ ...relics, ...{ [v.slotKey]: v } })
        )
      )
    }
  }, [character?.equippedRelics, characterKey, database, relics])

  return relics
}
