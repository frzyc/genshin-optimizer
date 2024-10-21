import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
/**
 * @deprecated move to sr-db-ui
 */
export function useTeam(teamId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.teams, teamId)
}
