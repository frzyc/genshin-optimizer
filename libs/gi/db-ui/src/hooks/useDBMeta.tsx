import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'

export function useDBMeta() {
  const database = useDatabase()
  return useDataEntryBase(database?.dbMeta) ?? { gender: 'F' }
}
