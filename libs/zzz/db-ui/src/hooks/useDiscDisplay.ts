import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'
export function useDisplayDisc() {
  const { database } = useDatabaseContext()
  return useDataEntryBase(database.displayDisc)
}
