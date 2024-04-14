import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useCallback } from 'react'

export default function useCharacterReducer(characterKey: CharacterKey | '') {
  const database = useDatabase()

  return useCallback(
    (action: Partial<ICachedCharacter>): void => {
      if (!characterKey) return
      const character = database.chars.get(characterKey)
      if (!character) return
      database.chars.set(characterKey, { ...character, ...action })
    },
    [characterKey, database]
  )
}
