import { useDataManagerBase } from '@genshin-optimizer/common-database-ui'
import type { GeneratedBuildList } from '@genshin-optimizer/gi-db'
import { useDatabase } from './useDatabase'

export function useGeneratedBuildList(
  listId: string
): GeneratedBuildList | undefined {
  const database = useDatabase()

  return useDataManagerBase(database.generatedBuildList, listId)
}
