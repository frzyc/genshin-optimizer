import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useContext } from 'react'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'

export default function useCharacter(characterKey: CharacterKey) {
  const database = useDatabase()
  return useDataManagerBase(database.chars, characterKey)
}
