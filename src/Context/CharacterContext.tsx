import { createContext } from "react"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import { characterReducerAction } from "../ReactHooks/useCharacterReducer"
import { ICachedCharacter } from "../Types/character"
export type CharacterContextObj = {
  character: ICachedCharacter
  characterSheet: CharacterSheet
  characterDispatch: (action: characterReducerAction) => void
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const CharacterContext = createContext({} as CharacterContextObj)
