import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../Context'
export function useBuild(buildId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.builds, buildId ?? '')
}
