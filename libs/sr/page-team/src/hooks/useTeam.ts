import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '@genshin-optimizer/sr/ui'
export function useTeam(teamId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.teams, teamId)
}
