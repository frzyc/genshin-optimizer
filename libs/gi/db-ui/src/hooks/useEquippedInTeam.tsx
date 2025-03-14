import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { useContext, useMemo } from 'react'
import { TeamCharacterContext } from '../contexts'
import { useDatabase } from './useDatabase'

/** Check if any of the teammates are using the weapon/arts inputted */
export function useEquippedInTeam(
  weaponId: string,
  artifactIds: Record<ArtifactSlotKey, string | undefined>,
) {
  const database = useDatabase()
  const {
    teamCharId,
    team: { loadoutData },
  } = useContext(TeamCharacterContext)
  const weaponUsedInLoadoutDatum = loadoutData?.find(
    (loadoutDatum) =>
      loadoutDatum &&
      loadoutDatum.teamCharId !== teamCharId &&
      database.teams.getLoadoutWeapon(loadoutDatum).id === weaponId,
  )
  const weaponUsedInTeamCharKey =
    weaponUsedInLoadoutDatum &&
    database.teamChars.get(weaponUsedInLoadoutDatum?.teamCharId)!.key

  const artUsedInTeamCharKeys = useMemo(
    () =>
      objKeyMap(allArtifactSlotKeys, (slotKey) => {
        const artId = artifactIds[slotKey]
        if (!artId) return undefined
        const loadoutDatum = loadoutData?.find(
          (loadoutDatum) =>
            loadoutDatum &&
            loadoutDatum.teamCharId !== teamCharId &&
            database.teams.getLoadoutArtifacts(loadoutDatum)[slotKey]?.id ===
              artId,
        )
        return (
          loadoutDatum && database.teamChars.get(loadoutDatum.teamCharId)!.key
        )
      }),
    [artifactIds, database, loadoutData, teamCharId],
  )

  return {
    weaponUsedInTeamCharKey,
    artUsedInTeamCharKeys,
  }
}
