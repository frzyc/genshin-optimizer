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
  /**
   * @deprecated, should be provided from CharacterContext
   */
  character: ICachedCharacter
  /**
   * @deprecated, should be provided from CharacterContext
   */
  characterSheet: CharacterSheet
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const TeamCharacterContext = createContext({
  teamChar: {},
  team: {},
} as TeamCharacterContextObj)
