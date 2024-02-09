import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useContext } from 'react'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

export default function useArtifact(artifactID: string | undefined = '') {
  const database = useDatabase()
  return useDataManagerBase(database.arts, artifactID)
}
