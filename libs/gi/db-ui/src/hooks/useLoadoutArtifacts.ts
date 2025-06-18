import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useArtifacts } from './useArtifacts'
import { useCharacter } from './useCharacter'
import { useDatabase } from './useDatabase'

export function useLoadoutArtifacts(loadoutDatum: LoadoutDatum) {
  const database = useDatabase()
  const teamChar = useDataManagerBase(
    database.teamChars,
    loadoutDatum.teamCharId
  )
  const char = useCharacter(teamChar?.key as CharacterKey)
  const build = useDataManagerBase(database.builds, loadoutDatum.buildId)
  return useArtifacts(
    loadoutDatum.buildType === 'equipped'
      ? char?.equippedArtifacts
      : loadoutDatum.buildType === 'real'
        ? build?.artifactIds
        : undefined
  )
}
