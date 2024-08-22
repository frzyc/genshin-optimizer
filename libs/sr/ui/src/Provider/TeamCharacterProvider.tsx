import type { LoadoutDatum, Team } from '@genshin-optimizer/sr/db'
import { Skeleton } from '@mui/material'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { TeamCharacterContextObj } from '../Context/TeamCharacterContext'
import { TeamCharacterContext } from '../Context/TeamCharacterContext'
import { useTeamChar } from '../Hook/useTeamChar'

export function TeamCharacterProvider({
  children,
  teamId,
  team,
  loadoutDatum,
}: {
  children: ReactNode
  teamId: string
  team: Team
  loadoutDatum?: LoadoutDatum
}) {
  const teamCharId = loadoutDatum?.teamCharId
  const teamChar = useTeamChar(teamCharId ?? '')
  const teamCharacterContextObj: TeamCharacterContextObj | undefined =
    useMemo(() => {
      if (!teamCharId || !teamChar || !loadoutDatum) return undefined
      return { teamId, team, teamCharId, teamChar, loadoutDatum }
    }, [loadoutDatum, team, teamChar, teamCharId, teamId])

  return teamCharacterContextObj ? (
    <TeamCharacterContext.Provider value={teamCharacterContextObj}>
      {children}
    </TeamCharacterContext.Provider>
  ) : (
    <Skeleton variant="rectangular" width="100%" height={1000} />
  )
}
