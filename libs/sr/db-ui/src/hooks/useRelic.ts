import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'
export function useRelic(relicId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.relics, relicId ?? '')
}
