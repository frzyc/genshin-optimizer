import { useDataManagerBase } from '@genshin-optimizer/database-ui'
import { useContext } from 'react'
import { DatabaseContext } from '../Database/Database'

export default function useArtifact(artifactID: string | undefined = '') {
  const { database } = useContext(DatabaseContext)
  return useDataManagerBase(database.arts, artifactID)
}
