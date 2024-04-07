import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter, ICachedWeapon } from '@genshin-optimizer/gi/db'
import type { CharacterSheet, WeaponSheet } from '@genshin-optimizer/gi/sheets'
import type { UIData } from '@genshin-optimizer/gi/ui'
import { createContext } from 'react'
export type TeamData = Partial<
  Record<
    CharacterKey,
    {
      target: UIData
      buffs: Dict<CharacterKey, UIData>
      character: ICachedCharacter
      weapon: ICachedWeapon
      characterSheet: CharacterSheet
      weaponSheet: WeaponSheet
    }
  >
>
export type dataContextObj = {
  data: UIData
  compareData?: UIData
  teamData: TeamData
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const DataContext = createContext({} as dataContextObj)
