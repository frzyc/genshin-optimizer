import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'
export function useBuild(buildId: string) {
  const database = useDatabase()
  return useDataManagerBase(database.builds, buildId)
}
