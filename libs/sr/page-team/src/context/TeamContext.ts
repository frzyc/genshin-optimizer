import type { Team, TeammateDatum } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type TeamContextObj = {
  teamId: string
  team: Team
  teammateDatum: TeammateDatum
}

export const TeamContext = createContext({} as TeamContextObj)

export function useTeamContext() {
  return useContext(TeamContext)
}
