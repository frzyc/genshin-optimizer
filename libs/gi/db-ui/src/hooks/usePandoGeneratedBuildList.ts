import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'

export function usePandoGeneratedBuildList(listId: string) {
  const database = useDatabase()
  return useDataManagerBase(database.pandoGeneratedBuildList, listId)
}
