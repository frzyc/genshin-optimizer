import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'
export function useBuildTc(buildTcId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.buildTcs, buildTcId ?? '')
}
