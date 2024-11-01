import type { Team, TeammateDatum } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type TeamContextObj = {
  teamId: string
  team: Team
  teammateDatum: TeammateDatum
}

export const TeamContext = createContext({
  teamId: '',
  team: {},
  teammateDatum: { buildType: 'equipped', buildId: '' },
} as TeamContextObj)

export function useTeamContext() {
  return useContext(TeamContext)
}
