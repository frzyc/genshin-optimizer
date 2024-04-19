import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'
export function useOptConfig(optConfigId: string) {
  const database = useDatabase()
  return useDataManagerBase(database.optConfigs, optConfigId)
}
