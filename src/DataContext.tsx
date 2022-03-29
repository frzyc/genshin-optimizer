import { createContext } from "react"
import CharacterSheet from "./Data/Characters/CharacterSheet"
import { UIData } from "./Formula/uiData"
import { ICachedCharacter } from "./Types/character"
import { CharacterKey } from "./Types/consts"
import { ICachedWeapon } from "./Types/weapon"
import WeaponSheet from "./Data/Weapons/WeaponSheet"
export type TeamData = Partial<Record<CharacterKey, {
  target: UIData
  buffs: Dict<CharacterKey, UIData>
  character: ICachedCharacter
  weapon: ICachedWeapon
  characterSheet: CharacterSheet
  weaponSheet: WeaponSheet,
}>>
export type dataContextObj = {
  character: ICachedCharacter
  characterSheet: CharacterSheet
  data: UIData
  oldData?: UIData
  mainStatAssumptionLevel: number
  teamData: TeamData
  characterDispatch: (_: any) => void
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const DataContext = createContext({} as dataContextObj)
