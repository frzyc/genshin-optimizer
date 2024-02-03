import type { CharacterKey } from '@genshin-optimizer/gi_consts'
import { useContext } from 'react'
import { DatabaseContext } from '../Database/Database'

import { useDataManagerBase } from '@genshin-optimizer/common_database-ui'

export default function useCharacter(characterKey: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  return useDataManagerBase(database.chars, characterKey)
}
