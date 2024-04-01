import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'

export function useDisplayArtifact() {
  const database = useDatabase()
  return useDataEntryBase(database.displayArtifact)
}
