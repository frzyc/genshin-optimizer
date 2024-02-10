import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'
export function useTeamChar(teamCharId: string) {
  const database = useDatabase()
  return useDataManagerBase(database.teamChars, teamCharId)
}
