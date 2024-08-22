import type {
  LoadoutDatum,
  Team,
  TeamCharacter,
} from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type TeamCharacterContextObj = {
  teamId: string
  team: Team
  teamCharId: string
  teamChar: TeamCharacter
  loadoutDatum: LoadoutDatum
}

export const TeamCharacterContext = createContext({} as TeamCharacterContextObj)

export function useTeamCharacterContext() {
  return useContext(TeamCharacterContext)
}
