import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
export function useTeam(teamId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.teams, teamId)
}
