import type { Team } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type TeamContextObj = {
  teamId: string
  team: Team
}

export const TeamContext = createContext({
  teamId: '',
  team: {},
} as TeamContextObj)

export function useTeamContext() {
  return useContext(TeamContext)
}
