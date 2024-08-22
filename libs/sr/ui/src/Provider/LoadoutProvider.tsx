import type { LoadoutMetadatum, Team } from '@genshin-optimizer/sr/db'
import { Skeleton } from '@mui/material'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { LoadoutContextObj } from '../Context/LoadoutContext'
import { LoadoutContext } from '../Context/LoadoutContext'
import { useTeamChar } from '../Hook/useTeamChar'

export function LoadoutProvider({
  children,
  teamId,
  team,
  loadoutMetadatum,
}: {
  children: ReactNode
  teamId: string
  team: Team
  loadoutMetadatum?: LoadoutMetadatum
}) {
  const loadoutId = loadoutMetadatum?.loadoutId
  const loadout = useTeamChar(loadoutId ?? '')
  const loadoutContextObj: LoadoutContextObj | undefined = useMemo(() => {
    if (!loadoutId || !loadout || !loadoutMetadatum) return undefined
    return { teamId, team, loadoutId, loadout, loadoutMetadatum }
  }, [loadoutMetadatum, team, loadout, loadoutId, teamId])

  return loadoutContextObj ? (
    <LoadoutContext.Provider value={loadoutContextObj}>
      {children}
    </LoadoutContext.Provider>
  ) : (
    <Skeleton variant="rectangular" width="100%" height={1000} />
  )
}
