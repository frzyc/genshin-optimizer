import { createContext } from "react"
import CharacterSheet from "./Character/CharacterSheet_WR"
import { UIData } from "./Formula/uiData"
import { ICachedCharacter } from "./Types/character_WR"

export type dataContextObj = {
  character: ICachedCharacter,
  characterSheet: CharacterSheet
  data: UIData,
  oldData?: UIData,
  characterDispatch: (any) => void
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const DataContext = createContext({} as dataContextObj)
