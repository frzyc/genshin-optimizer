import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'

export function useWengine(wengineId: string | undefined = '') {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.wengines, wengineId)
}
