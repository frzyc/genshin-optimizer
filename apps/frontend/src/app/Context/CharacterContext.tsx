import { createContext } from 'react'
import type CharacterSheet from '../Data/Characters/CharacterSheet'
import type { characterReducerAction } from '../ReactHooks/useCharacterReducer'
import type { ICachedCharacter } from '../Types/character'
export type CharacterContextObj = {
  character: ICachedCharacter
  characterSheet: CharacterSheet
  characterDispatch: (action: characterReducerAction) => void
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const CharacterContext = createContext({} as CharacterContextObj)
