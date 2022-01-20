import { createContext } from "react"
import CharacterSheet from "./Character/CharacterSheet_WR"
import { UIData } from "./Formula/uiData"
import { ICachedCharacter } from "./Types/character_WR"

type dataContextObj = {
  character?: ICachedCharacter,
  characterSheet?: CharacterSheet
  data?: UIData,
  oldData?: UIData,
  setCompareData?: ((boolean) => void),
  characterDispatch?: (any) => void
}
export const DataContext = createContext({
  character: undefined,
  characterSheet: undefined,
  data: undefined,
  oldData: undefined,
  setCompareData: undefined,
  characterDispatch: undefined,
} as dataContextObj)