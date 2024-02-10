import type {
  ICachedCharacter,
  Team,
  TeamCharacter,
} from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
import type CharacterSheet from '../Data/Characters/CharacterSheet'
export type TeamCharacterContextObj = {
  teamId: string
  team: Team
  teamCharId: string
  teamChar: TeamCharacter
  character: ICachedCharacter
  characterSheet: CharacterSheet
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const TeamCharacterContext = createContext({} as TeamCharacterContextObj)
