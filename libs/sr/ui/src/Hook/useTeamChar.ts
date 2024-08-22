import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
export function useTeamChar(loadoutId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.loadouts, loadoutId)
}
