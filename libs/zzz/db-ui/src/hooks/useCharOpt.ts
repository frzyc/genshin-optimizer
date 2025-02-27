import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '../context'

export function useCharOpt(characterKey: CharacterKey | '' | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.charOpts, characterKey as CharacterKey)
}
