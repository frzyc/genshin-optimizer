import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Team } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '../context'

export function useTeam(
  characterKey: CharacterKey | '' | undefined
): Team | undefined {
  const { database } = useDatabaseContext()
  const manager = database.teams

  if (characterKey && !manager.get(characterKey))
    manager.getOrCreate(characterKey)

  return useDataManagerBase(manager, characterKey as CharacterKey)
}
