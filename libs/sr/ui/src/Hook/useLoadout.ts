import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
/**
 * @deprecated move to sr-db-ui
 */
export function useLoadout(loadoutId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.loadouts, loadoutId ?? '')
}
