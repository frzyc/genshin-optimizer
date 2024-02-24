import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'
export function useBuildTc(buildTcId: string) {
  const database = useDatabase()
  return useDataManagerBase(database.buildTcs, buildTcId)
}
