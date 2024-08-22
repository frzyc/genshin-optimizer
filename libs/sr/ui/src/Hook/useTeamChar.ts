import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
export function useTeamChar(teamCharId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.teamChars, teamCharId)
}
