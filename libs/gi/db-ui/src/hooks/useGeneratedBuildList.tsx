import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'

export function useGeneratedBuildList(listId: string) {
  const database = useDatabase()

  return useDataManagerBase(database.generatedBuildList, listId)
}
