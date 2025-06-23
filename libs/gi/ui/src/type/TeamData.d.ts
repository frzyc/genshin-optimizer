import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter, ICachedWeapon } from '@genshin-optimizer/gi/db'
import type { CharacterSheet, WeaponSheet } from '@genshin-optimizer/gi/sheets'
import type { UIData } from '@genshin-optimizer/gi/uidata'
export type TeamData = Partial<
  Record<
    CharacterKey,
    {
      target: UIData
      character: ICachedCharacter
      weapon: ICachedWeapon
      characterSheet: CharacterSheet
      weaponSheet: WeaponSheet
    }
  >
>
