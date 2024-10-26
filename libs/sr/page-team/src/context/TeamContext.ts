import type { Team, TeamMetadatum } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type TeamContextObj = {
  teamId: string
  team: Team
  teamMetadatum: TeamMetadatum
}

export const TeamContext = createContext({} as TeamContextObj)

export function useTeamContext() {
  return useContext(TeamContext)
}
