import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'
export function useTeam(teamId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.teams, teamId)
}
