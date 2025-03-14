import { notEmpty } from '@genshin-optimizer/common/util'
import { useContext, useMemo } from 'react'
import { TeamCharacterContext } from '../contexts'
import { useDatabase } from './useDatabase'

export function useTeammateArtifactIds() {
  const {
    teamCharId,
    team: { loadoutData },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  return useMemo(
    () =>
      Array.from(
        new Set(
          loadoutData
            .filter(notEmpty)
            .filter((loadoutDatum) => loadoutDatum.teamCharId !== teamCharId)
            .map((loadoutDatum) =>
              database.teams.getLoadoutArtifacts(loadoutDatum),
            )
            .flatMap((arts) => Object.values(arts))
            .filter(notEmpty)
            .map(({ id }) => id),
        ),
      ),
    [database, loadoutData, teamCharId],
  )
}
