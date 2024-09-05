import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
export function useLoadout(loadoutId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.loadouts, loadoutId ?? '')
}
