import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '../context'

export function useCharacter(characterKey: CharacterKey | '' | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.chars, characterKey as CharacterKey)
}
