import type {
  LoadoutDatum,
  Team,
  TeamCharacter,
} from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
export type TeamCharacterContextObj = {
  teamId: string
  team: Team
  teamCharId: string
  teamChar: TeamCharacter
  loadoutDatum: LoadoutDatum
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const TeamCharacterContext = createContext({
  teamChar: {},
  team: {},
  loadoutDatum: {},
} as TeamCharacterContextObj)
