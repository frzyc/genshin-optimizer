import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'

export function useArtifact(artifactID: string | undefined = '') {
  const database = useDatabase()
  return useDataManagerBase(database.arts, artifactID)
}
