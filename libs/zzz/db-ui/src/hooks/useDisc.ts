import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'
export function useDisc(discId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.discs, discId ?? '')
}
