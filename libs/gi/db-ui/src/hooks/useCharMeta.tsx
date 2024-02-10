import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from './useDatabase'

export function useCharMeta(key: CharacterKey) {
  const database = useDatabase()
  return useDataManagerBase(database.charMeta, key)
}
