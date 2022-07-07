import { createContext } from "react"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import WeaponSheet from "../Data/Weapons/WeaponSheet"
import { UIData } from "../Formula/uiData"
import { ICachedCharacter } from "../Types/character"
import { CharacterKey } from "../Types/consts"
import { ICachedWeapon } from "../Types/weapon"
export type TeamData = Partial<Record<CharacterKey, {
  target: UIData
  buffs: Dict<CharacterKey, UIData>
  character: ICachedCharacter
  weapon: ICachedWeapon
  characterSheet: CharacterSheet
  weaponSheet: WeaponSheet,
}>>
export type dataContextObj = {
  data: UIData
  oldData?: UIData
  teamData: TeamData
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const DataContext = createContext({} as dataContextObj)
