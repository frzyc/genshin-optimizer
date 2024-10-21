import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
export function useCombo(comboId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.combos, comboId)
}
