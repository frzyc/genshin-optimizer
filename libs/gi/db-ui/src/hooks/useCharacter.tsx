import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from './useDatabase'

export function useCharacter(characterKey: CharacterKey) {
  const database = useDatabase()
  return useDataManagerBase(database.chars, characterKey)
}
