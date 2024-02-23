import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'
export function useTeam(teamId: string) {
  const database = useDatabase()
  return useDataManagerBase(database.teams, teamId)
}
