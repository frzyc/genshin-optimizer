import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'
export function useRelic(discId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.discs, discId ?? '')
}
