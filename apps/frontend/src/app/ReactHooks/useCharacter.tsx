import type { CharacterKey } from '@genshin-optimizer/consts'
import { useContext } from 'react'
import { DatabaseContext } from '../Database/Database'

import { useDataManagerBase } from '@genshin-optimizer/database-ui'

export default function useCharacter(characterKey: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  return useDataManagerBase(database.chars, characterKey)
}
